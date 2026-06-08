# Backend - Arquitectura

## Estructura

```
backend/
├── server.js                    # Entry point
├── .env                         # Variables de entorno
├── package.json
└── src/
    ├── config/
    │   └── db.js               # pg.Pool (conexion PostgreSQL)
    ├── middlewares/
    │   └── auth.middleware.js   # JWT verify + requireRole
    ├── models/
    │   ├── auth.model.js        # Queries SQL: auth
    │   ├── user.model.js        # Queries SQL: usuarios
    │   └── product.model.js     # Queries SQL: productos
    ├── services/
    │   ├── auth.service.js      # Logica: register, login, reset
    │   ├── user.service.js      # Logica: CRUD usuarios
    │   └── product.service.js   # Logica: CRUD productos
    ├── controllers/
    │   ├── auth.controller.js   # HTTP handlers: auth
    │   ├── user.controller.js   # HTTP handlers: usuarios
    │   └── product.controller.js # HTTP handlers: productos + Socket.io
    └── routes/
        ├── auth.routes.js       # /api/auth/*
        ├── user.routes.js       # /api/users/* (admin-only)
        └── product.routes.js    # /api/products/* (mixed)
```

## Flujo de una Peticion

```
HTTP Request
    |
    v
server.js (Express middleware: cors, json)
    |
    v
routes/ (define path + method)
    |
    v
middlewares/auth.middleware.js (JWT verify, role check)
    |
    v
controllers/ (validacion de entrada, orchestration)
    |
    v
services/ (logica de negocio, bcrypt, JWT)
    |
    v
models/ (queries SQL puras contra pg pool)
    |
    v
PostgreSQL (database cloud_catalog)
```

## server.js - Punto de Entrada

```javascript
// Middlewares globales
app.use(cors());
app.use(express.json());

// Socket.io
app.locals.io = io;

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Estaticos (frontend build)
app.use(express.static(frontendPath));

// SPA fallback (Express 5 syntax)
app.get('/{*splat}', (req, res) => { ... });
```

**Puerto:** 5000 (configurado en `.env`)

**Express 5:** Usar `/{*splat}` en vez de `*` para rutas wildcard.

---

## config/db.js

```javascript
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
```

Exporta un `pg.Pool` que se usa en todos los models.

---

## middlewares/auth.middleware.js

### `authenticateToken`

Verifica el JWT del header `Authorization: Bearer <token>`.

```javascript
// Si no hay token: 401
// Si token invalido: 403
// Si valido: req.user = { id, usuario, email, rol }
```

### `requireRole(roles)`

Factory function que retorna un middleware.

```javascript
router.post('/', authenticateToken, requireRole(['empleado', 'admin']), controller.create);
```

Si `req.user.rol` no esta en `roles`: retorna 403.

---

## Models

Los models son queries SQL puras. No logica de negocio.

### auth.model.js

| Metodo | SQL | Descripcion |
|--------|-----|-------------|
| `findByUsername(usuario)` | `SELECT * FROM usuarios WHERE usuario = $1` | Login |
| `findByEmail(email)` | `SELECT * FROM usuarios WHERE email = $1` | Forgot password |
| `findById(id)` | `SELECT id, nombre, usuario, email, rol, created_at FROM usuarios WHERE id = $1` | Profile |
| `create({...})` | `INSERT INTO usuarios ...` | Registro |
| `setResetToken(email, token, expiry)` | `UPDATE usuarios SET reset_token=$1, reset_token_expiry=$2 WHERE email=$3` | Guardar token |
| `findByResetToken(token)` | `SELECT * FROM usuarios WHERE reset_token=$1 AND reset_token_expiry > NOW()` | Validar token |
| `updatePassword(id, hash)` | `UPDATE usuarios SET password_hash=$1, reset_token=NULL, reset_token_expiry=NULL WHERE id=$2` | Cambiar contrasena |

### user.model.js

| Metodo | Descripcion |
|--------|-------------|
| `findAll()` | Lista todos los usuarios (sin password_hash) |
| `findById(id)` | Busca usuario por ID |
| `updateRole(id, rol)` | Actualiza rol |
| `delete(id)` | Elimina usuario |
| `countByRole()` | Conteo agrupado por rol |

### product.model.js

| Metodo | Descripcion |
|--------|-------------|
| `findAll()` | Todos los productos con LEFT JOIN a categorias |
| `findById(id)` | Producto por ID con categoria |
| `findByCategory(categoriaId)` | Productos filtrados por categoria |
| `findCategories()` | Lista de categorias |
| `create({...})` | INSERT con RETURNING |
| `update(id, {...})` | UPDATE con RETURNING |
| `delete(id)` | DELETE con RETURNING |

---

## Services

### auth.service.js

- **register:** Verifica duplicados (usuario + email), hashea contrasena con bcrypt (10 rounds), crea usuario
- **login:** Busca por usuario, compara con bcrypt.compare, genera JWT con payload `{id, usuario, email, rol}`, expira en 24h
- **forgotPassword:** Genera token con `crypto.randomBytes(32)`, guarda con expiracion de 1 hora
- **resetPassword:** Valida token no expirado, hashea nueva contrasena, limpia token

### user.service.js

- **getAll:** Retorna usuarios sin password_hash
- **getById:** Busca por ID
- **updateRole:** Valida que el rol sea valido antes de actualizar
- **delete:** Elimina usuario
- **getStats:** Retorna conteo por rol

### product.service.js

- **getAll:** Retorna productos con nombre de categoria
- **getById:** Busca por ID con categoria
- **getByCategory:** Filtra por categoria
- **getCategories:** Lista categorias
- **create:** Valida nombre requerido, precio > 0, stock >= 0
- **update:** Valida que el producto exista
- **delete:** Valida que el producto exista

---

## Controllers

Los controllers orquestan la capa HTTP. Los product controllers tambien emiten eventos Socket.io.

### Socket.io en Products

```javascript
// En create, update, delete:
req.app.locals.io.emit('product:created', newProduct);
req.app.locals.io.emit('product:updated', updatedProduct);
req.app.locals.io.emit('product:deleted', { id });
```

El instance de `io` se accede via `req.app.locals.io` (seteado en server.js).

---

## Variables de Entorno (.env)

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cloud_catalog
JWT_SECRET=catalog_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

---

## Dependencias

### Produccion

| Paquete | Uso |
|---------|-----|
| express@^5.2.1 | Framework HTTP |
| pg@^8.20.0 | Cliente PostgreSQL |
| bcrypt@^6.0.0 | Hash de contrasenas |
| jsonwebtoken@^9.0.2 | JWT tokens |
| cors@^2.8.6 | Cross-Origin Resource Sharing |
| dotenv@^17.4.2 | Variables de entorno |
| socket.io@^4.8.1 | WebSocket real-time |

### Desarrollo

| Paquete | Uso |
|---------|-----|
| nodemon@^3.1.14 | Auto-restart en cambios |
| cross-env@^7.0.3 | Variables de entorno cross-platform |
