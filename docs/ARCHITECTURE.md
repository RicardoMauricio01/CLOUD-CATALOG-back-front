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
| `authService` | register (verifica duplicados + bcrypt), login (bcrypt.compare + JWT), forgotPassword (crypto.randomBytes), resetPassword |
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
- **Response**: en 401/403 limpia sesion y redirige a `/login`

Los 3 services (`authService`, `userService`, `productService`) importan desde `http.js`.

### Estructura de vistas

Cada feature en su propia carpeta bajo `presentation/`:

| Carpeta | Componentes | CSS propio |
|---------|-------------|------------|
| `LoginView/` | LoginView.vue (orquestador), LoginForm.vue (formulario) | login.css |
| `ClientCatalogView/` | ClientCatalogView.vue (hero + grid), CatalogItem.vue (tarjeta) | catalog.css |
| `AdminInventoryView/` | AdminInventoryView.vue (tabla + Socket.io), ProductForm.vue (modal) | inventory.css |
| `AdminUsersView/` | AdminUsersView.vue (tabla + stats), UserModal.vue (crear usuario) | admin-users.css |
| `widgets/` | NavBar.vue | (usa estilos globales) |

### Estilos

- **Globales**: `assets/styles.css` — navbar, cards, forms, buttons, modals, alerts, empty-state, CSS variables
- **Por vista**: cada carpeta importa su propio `.css` en el `<script setup>` de la vista
