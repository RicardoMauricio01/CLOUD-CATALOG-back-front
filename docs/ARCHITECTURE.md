# Arquitectura

## Backend — Capas (Controller → Service → DAO → DTO)

```
HTTP Request
    |
    v
routes/          (definicion de rutas + middlewares de autenticacion)
    |
    v
middlewares/     (authenticateToken + requireRole)
    |
    v
controllers/     (validacion de entrada HTTP, llama al service, responde)
    |
    v
services/        (logica de negocio: bcrypt, JWT, crypto, reglas de validacion)
    |
    v
dao/             (queries SQL con pg pool, solo SELECT/INSERT/UPDATE/DELETE)
    |
    v
dtos/            (transformacion: filtrar password_hash, parsear precios)
    |
    v
PostgreSQL       (cloud_catalog)
```

### server.js

Punto de entrada. Configura:

- `cors()` + `express.json()` como middlewares globales
- Socket.io sobre el mismo servidor HTTP, accesible via `req.app.locals.io`
- Rutas: `/api/auth`, `/api/users`, `/api/products`
- Archivos estaticos: sirve `frontend/dist/` en produccion
- SPA fallback: cualquier ruta no-API sirve `index.html`

```js
app.get('/{*splat}', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
        res.status(404).json({ error: 'Endpoint no encontrado' });
    }
});
```

Express 5 usa `/{*splat}` en vez de `*` para wildcard.

### config/db.js

Pool de conexiones PostgreSQL con `pg.Pool`. Configurado via `.env`.

```js
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});
```

### routes/

Archivos planos que mapean metodos HTTP a controladores.

| Archivo | Prefijo | Auth global |
|---------|---------|-------------|
| `authRoutes.js` | `/api/auth` | No |
| `userRoutes.js` | `/api/users` | `router.use(authenticateToken)` + `requireRole(['admin'])` |
| `productRoutes.js` | `/api/products` | Solo en POST/PUT/DELETE via `router.use()` despues de GET |

### middlewares/authMiddleware.js

Dos funciones:

- **`authenticateToken`**: extrae token del header `Authorization: Bearer`, verifica con `jwt.verify()`, inyecta `req.user`
- **`requireRole(roles)`**: factory que retorna middleware, verifica `req.user.rol` contra el array de roles permitidos

### controllers/

Validan los datos de entrada (campos requeridos, tipos basicos) y delegan al service. Los controllers de productos emiten eventos Socket.io.

```
Controller                              Service
    |                                       |
    |-- valida req.body                   --|
    |-- llama service.method(data)       -->|-- valida reglas de negocio
    |                                       |-- llama dao.method()
    |                                       |-- transforma con DTO
    |                                       |-- retorna resultado
    |<-- responde res.json(result)      <--|
```

### services/

Logica de negocio pura, sin dependencia HTTP:

| Service | Funcionalidad |
|---------|---------------|
| `authService` | register (verifica duplicados + bcrypt + color_favorito), login (bcrypt.compare + JWT), forgotPassword (valida color_favorito + crypto.randomBytes), resetPassword |
| `userService` | CRUD usuarios, validacion de roles, transformacion con DTO |
| `productService` | CRUD productos, validacion de datos con `validateProductData()` y `sanitizeProductData()` reutilizados en create/update |

### dao/ (Data Access Objects)

Queries SQL parametrizadas con `pg`. Sin logica de negocio.

| Archivo | Tabla | Metodos |
|---------|-------|---------|
| `userDao.js` | usuarios | findByUsername, findByEmail, findById, findAll, create, updateRole, delete, countByRole, setResetToken, findByResetToken, updatePassword |
| `productDao.js` | productos + categorias | findAll (LEFT JOIN), findByCategory, findById, create, update, delete, findCategories |

### dtos/ (Data Transfer Objects)

Transforman los datos antes de enviarlos al cliente:

| Archivo | Funcion | Que hace |
|---------|---------|----------|
| `userDto.js` | `toPublicUser` | Elimina `password_hash`, `reset_token`, `reset_token_expiry` |
| `productDto.js` | `toProductResponse` | Parsea `precio` de string a float |

---

## Frontend — Vistas (Vue 3 + Pinia + Router)

```
main.js
  |-- createPinia()
  |-- router (Vue Router)
  |-- mount(App)
        |
        App.vue
          |-- NavBar (widget)
          |-- <router-view />
                |
                +-- LoginView        /login
                +-- ClientCatalogView  /
                +-- AdminInventoryView  /admin/products  (empleado/admin)
                +-- AdminUsersView      /admin/users     (admin only)
```

### Flujo de autenticacion

```
LoginView
  |-- submit (usuario + password)
  |-- authService.login() -> { token, user }
  |-- store.login(token, user)
  |       |-- guarda en localStorage
  |       |-- actualiza estado reactivo
  |-- router.push('/')
```

### Recuperacion de contrasena con color favorito

```
Registro:
  |-- formulario incluye campo "Color favorito"
  |-- se guarda en DB al crear usuario

Olvide contrasena:
  |-- usuario ingresa email + color favorito
  |-- POST /api/auth/forgot-password { email, color_favorito }
  |-- backend verifica que el color coincida (case-insensitive)
  |     |-- si no coincide → error "Color favorito incorrecto"
  |     |-- si coincide → genera token de restablecimiento (1h de validez)
  |-- frontend guarda el token automaticamente (invisible para el usuario)
  |-- usuario solo ingresa su nueva contrasena + confirmacion
  |-- POST /api/auth/reset-password { token (auto), newPassword }
```

### Proteccion de roles en AdminUsersView

- Un admin **no puede cambiar su propio rol** (select deshabilitado para si mismo)
- Al asignar rol `admin` a otro usuario, se muestra un `confirm()` de confirmacion
- El backend tambien valida que un admin no pueda cambiarse su propio rol via API

### Proteccion de rutas

El guard `router.beforeEach` en `router/index.js`:

```js
router.beforeEach((to, from, next) => {
    const store = useAppStore();
    if (to.meta.requiresAuth && !store.user) return next('/login');
    if (to.meta.allowedRoles && store.user && !to.meta.allowedRoles.includes(store.user.rol)) return next('/');
    next();
});
```

### Estado global (Pinia)

`state/appState.js` — store `app` con:

- `user`, `token` — reactivos, sincronizados con localStorage
- `isLoggedIn`, `isAdmin`, `isEmpleado`, `canManageProducts` — computados
- `login(token, userData)`, `logout()` — acciones

### Servicios HTTP

`services/http.js` crea una instancia axios compartida con interceptors:

- **Request**: agrega `Authorization: Bearer <token>` de localStorage
- **Response**: en 401/403 limpia sesion y redirige a `/login`, pero **excluye las rutas `/auth/`** para no interrumpir el flujo de login y recuperacion de contrasena

Los 3 services (`authService`, `userService`, `productService`) importan desde `http.js`.

### Estructura de vistas

Cada feature en su propia carpeta bajo `presentation/`:

| Carpeta | Componentes | CSS propio |
|---------|-------------|------------|
| `LoginView/` | LoginView.vue (orquestador), LoginForm.vue (formulario) | login.css |
| `ClientCatalogView/` | ClientCatalogView.vue (hero + grid), CatalogItem.vue (tarjeta) | catalog.css |
| `AdminInventoryView/` | AdminInventoryView.vue (tabla + Socket.io), ProductForm.vue (modal) | inventory.css |
| `AdminUsersView/` | AdminUsersView.vue (tabla + stats), UserModal.vue (crear usuario) | admin-users.css |
| `widgets/` | NavBar.vue | Barra de navegacion con Home, Catalogo (scroll a productos), y enlaces por rol |

### Estilos

- **Globales**: `assets/styles.css` — navbar, cards, forms, buttons, modals, alerts, empty-state, CSS variables
- **Por vista**: cada carpeta importa su propio `.css` en el `<script setup>` de la vista
