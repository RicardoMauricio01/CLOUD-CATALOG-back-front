# Frontend - Arquitectura

## Estructura

```
frontend/
├── index.html                  # HTML entry point
├── vite.config.js              # Config Vite + proxy
├── package.json
└── src/
    ├── main.jsx                # Entry point React (BrowserRouter)
    ├── App.jsx                 # Componente raiz (auth state)
    ├── index.css               # Estilos globales (#90ee90 theme)
    ├── routes/
    │   └── AppRoutes.jsx       # React Router + Navbar + ProtectedRoute
    ├── services/
    │   ├── api.js              # Axios instance + JWT interceptor
    │   ├── auth.service.js     # API calls: auth
    │   ├── user.service.js     # API calls: users
    │   └── product.service.js  # API calls: products
    └── pages/
        ├── LoginPage.jsx       # Login, registro, forgot/reset password
        ├── ClientCatalog.jsx   # Catalogo publico de productos
        ├── AdminProdPage.jsx   # CRUD productos + Socket.io
        └── AdminUsersPage.jsx  # Gestion de usuarios (admin)
```

## Configuracion Vite

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', ws: true }
    }
  }
})
```

- Puerto dev: 3000
- Proxy `/api` -> backend:5000
- Proxy `/socket.io` -> backend:5000 (WebSocket)

---

## Flujo de la Aplicacion

```
main.jsx (BrowserRouter)
    |
    v
App.jsx (auth state: token, user, login, logout)
    |
    v
AppRoutes.jsx (React Router + ProtectedRoute)
    |
    +---> /login         -> LoginPage
    +---> /              -> ClientCatalog (public)
    +---> /admin/products -> AdminProdPage (empleado/admin)
    +---> /admin/users   -> AdminUsersPage (admin only)
```

---

## main.jsx

```jsx
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
```

---

## App.jsx

Componente raiz que maneja:

- **Estado de autenticacion:** `token` y `user` en useState + localStorage
- **login(token, userData):** Guarda en localStorage, actualiza estado
- **logout():** Limpia localStorage, redirige a /login
- **Persistencia:** Al montar, lee token/user de localStorage

```jsx
function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return <AppRoutes token={token} user={user} login={login} logout={logout} />;
}
```

---

## AppRoutes.jsx

### Rutas

| Ruta | Componente | Auth | Roles |
|------|-----------|------|-------|
| `/` | ClientCatalog | No | Todos |
| `/login` | LoginPage | No | Todos |
| `/admin/products` | AdminProdPage | Si | empleado, admin |
| `/admin/users` | AdminUsersPage | Si | admin |
| `*` | Redirect a `/` | - | - |

### ProtectedRoute

```jsx
function ProtectedRoute({ children, user, roles }) {
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.rol)) return <Navigate to="/" />;
    return children;
}
```

### Navbar

- "Catalogo": Siempre visible
- "Productos": Visible para empleado y admin
- "Usuarios": Visible solo para admin
- Boton Login/Logout: Segun estado de autenticacion
- Badge con nombre + rol del usuario

---

## services/api.js

```javascript
const api = axios.create({ baseURL: '/api' });

// Request interceptor: agrega JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor: maneja 401/403
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

---

## Paginas

### LoginPage (`/login`)

Formulario multi-modo controlado por estado `mode`:

| Modo | Campos | Accion |
|------|--------|--------|
| `login` | usuario, password | authService.login() -> App.login() |
| `register` | nombre, usuario, email, password, confirmPassword | authService.register() -> cambia a login |
| `forgot` | email | authService.forgotPassword() -> cambia a reset |
| `reset` | token (auto-fill), newPassword, confirmPassword | authService.resetPassword() -> cambia a login |

**Caracteristicas:**
- Mensajes de error/exito
- Loading state (deshabilita boton submit)
- Validacion de contrasenas coincidentes
- Link "Volver al login"

---

### ClientCatalog (`/`)

Catalogo publico de productos.

**Funcionalidades:**
- Carga categorias y productos en paralelo
- Filtro horizontal por categoria ("Todos" + cada categoria)
- Grid responsive: `repeat(auto-fill, minmax(260px, 1fr))`
- Tarjetas de producto con: imagen, nombre, descripcion, precio, categoria, stock

**Manejo de imagenes:**
- `object-fit: contain` para adaptar a cualquier proporcion
- Fallback "Sin imagen" si la URL falla
- Padding interno para imagenes pequenas

**Formato de precios:**
```javascript
const formatPrice = (price) => {
    return '$ ' + new Intl.NumberFormat('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};
```

---

### AdminProdPage (`/admin/products`)

Panel CRUD de productos con actualizaciones en tiempo real.

**Funcionalidades:**
- Tabla con: ID, Nombre, Precio, Stock, Categoria, Acciones
- Boton "Nuevo Producto" -> modal de creacion
- Boton "Editar" -> modal pre-llenado
- Boton "Eliminar" -> confirmacion + DELETE
- Socket.io: escucha `product:created`, `product:updated`, `product:deleted`
- Modal con formulario: nombre*, descripcion, precio*, stock, imagen_url, categoria_id

**Socket.io:**
```javascript
useEffect(() => {
    const socket = io();
    socket.on('product:created', (product) => { ... });
    socket.on('product:updated', (product) => { ... });
    socket.on('product:deleted', ({ id }) => { ... });
    return () => socket.disconnect();
}, []);
```

---

### AdminUsersPage (`/admin/users`)

Gestion de usuarios (solo admin).

**Funcionalidades:**
- Tarjetas de estadisticas: conteo por rol
- Tabla con: ID, Nombre, Usuario, Email, Rol (dropdown), Registro, Acciones
- Cambio de rol inline (select dropdown)
- Eliminar usuario con confirmacion
- Carga usuarios y stats en paralelo

---

## Estilos

### Tema

```css
:root {
    --primary: #90ee90;       /* Verde claro */
    --primary-dark: #6bc76b;
    --primary-light: #c8f7c8;
    --bg: #f8fdf8;            /* Fondo verde muy claro */
    --white: #ffffff;
    --text: #333333;
    --border: #e0e0e0;
    --danger: #ff6b6b;
    --danger-dark: #ee5a5a;
}
```

### Componentes

- **Botones:** `.btn-primary` (verde), `.btn-secondary` (gris), `.btn-danger` (rojo)
- **Forms:** `.form-group` con inputs, selects, textareas
- **Tabla:** `.table-container` con hover
- **Modal:** `.modal-overlay` + `.modal` con header/actions
- **Cards:** `.product-card` con hover effect
- **Alertas:** `.alert-error` (rojo), `.alert-success` (verde)
- **Navbar:** `.navbar` con flex, links verdes

---

## Dependencias

| Paquete | Uso |
|---------|-----|
| react@^19.1.0 | UI library |
| react-dom@^19.1.0 | DOM renderer |
| react-router-dom@^7.5.0 | Client-side routing |
| axios@^1.7.9 | HTTP client |
| socket.io-client@^4.8.1 | WebSocket client |
| vite@^6.3.2 | Build tool |
| @vitejs/plugin-react@^4.4.1 | React support for Vite |
