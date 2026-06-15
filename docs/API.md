# API REST — Cloud Catalog

Base URL: `http://localhost:5000/api`

---

## Autenticacion JWT

### Flujo

```
Login:  POST /api/auth/login  { usuario, password }
          -> Retorna { token, user }

Uso:    Authorization: Bearer <token> en cada request autenticado
```

### Payload del token

```json
{
  "id": 2,
  "usuario": "admin",
  "email": "admin@tienda.cl",
  "rol": "admin",
  "iat": 1780880044,
  "exp": 1780966444
}
```

- Algoritmo: HS256
- Expiracion: 24h (configurable via `JWT_EXPIRES_IN`)
- Secret: definido en `JWT_SECRET` del `.env`

### Almacenamiento (frontend)

```js
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(userData));
```

### Auto-logout

El interceptor de Axios (`services/http.js`) detecta 401/403, limpia localStorage y redirige a `/login`.

### Proteccion por ruta

| Metodo | Ruta | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/products` | No | Todos |
| GET | `/api/products/categories` | No | Todos |
| GET | `/api/products/category/:id` | No | Todos |
| GET | `/api/products/:id` | No | Todos |
| POST | `/api/products` | Si | empleado, admin |
| PUT | `/api/products/:id` | Si | empleado, admin |
| DELETE | `/api/products/:id` | Si | empleado, admin |
| GET | `/api/users` | Si | admin |
| GET | `/api/users/stats` | Si | admin |
| GET | `/api/users/:id` | Si | admin |
| PUT | `/api/users/:id/role` | Si | admin |
| DELETE | `/api/users/:id` | Si | admin |

---

## Health Check

### `GET /api/health`

**Response 200:**

```json
{
  "status": "OK",
  "message": "Cloud Catalog API funcionando",
  "timestamp": "2026-06-07T21:00:00.000Z"
}
```

---

## Auth (`/api/auth`)

### `POST /api/auth/register`

Registra un nuevo usuario.

**Body:**
```json
{
  "nombre": "Juan Perez",
  "usuario": "juan",
  "email": "juan@email.com",
  "password": "123456",
  "rol": "cliente"
}
```

`rol` es opcional (default `cliente`).

**Validaciones:**
- Todos los campos requeridos
- Password >= 6 caracteres
- Usuario y email unicos

**Response 201:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": { "id": 3, "nombre": "Juan Perez", "usuario": "juan", "email": "juan@email.com", "rol": "cliente", "created_at": "..." }
}
```

---

### `POST /api/auth/login`

Inicia sesion.

**Body:**
```json
{ "usuario": "admin", "password": "123456" }
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 2, "nombre": "Administrador", "usuario": "admin", "email": "admin@tienda.cl", "rol": "admin" }
}
```

---

### `POST /api/auth/forgot-password`

Solicita token de restablecimiento.

**Body:**
```json
{ "email": "admin@tienda.cl" }
```

**Response:**
```json
{
  "message": "Token de restablecimiento generado",
  "resetToken": "40a16f17ec2645813da0f67571749624..."
}
```

> El token se retorna en el body solo en desarrollo. En produccion se enviaria por email.
> Token: 32 bytes hex (64 chars), expira en 1 hora.

---

### `POST /api/auth/reset-password`

Restablece contrasena con token.

**Body:**
```json
{
  "token": "40a16f17ec2645813da0f67571749624...",
  "newPassword": "nueva1234"
}
```

**Validaciones:**
- Token y password requeridos
- Password >= 6 caracteres
- Token debe ser valido y no expirado

**Response 200:**
```json
{ "message": "Contrasena actualizada exitosamente" }
```

---

## Usuarios (`/api/users`)

Todos requieren autenticacion + rol `admin`.

### `GET /api/users`

Lista todos los usuarios (sin password_hash).

```json
[
  { "id": 1, "nombre": "Test", "usuario": "test", "email": "test@gmail.com", "rol": "cliente", "created_at": "...", "updated_at": "..." },
  { "id": 2, "nombre": "Administrador", "usuario": "admin", "email": "admin@tienda.cl", "rol": "admin", "created_at": "...", "updated_at": "..." }
]
```

### `GET /api/users/stats`

Conteo de usuarios por rol.

```json
[
  { "rol": "admin", "total": "1" },
  { "rol": "cliente", "total": "1" },
  { "rol": "empleado", "total": "0" }
]
```

### `GET /api/users/:id`

Usuario por ID.

### `PUT /api/users/:id/role`

Actualiza el rol. Roles validos: `cliente`, `empleado`, `admin`.

**Body:** `{ "rol": "empleado" }`

### `DELETE /api/users/:id`

Elimina usuario.

```json
{ "message": "Usuario eliminado exitosamente", "user": { "id": 1, "nombre": "Test", "usuario": "test" } }
```

---

## Productos (`/api/products`)

Endpoints GET son publicos. POST/PUT/DELETE requieren rol `empleado` o `admin`.

### `GET /api/products`

Todos los productos con nombre de categoria (LEFT JOIN).

```json
[
  {
    "id": 1,
    "nombre": "Fideo Espiral",
    "descripcion": "Fideo espiral 500g ideal para ensaladas y guisos",
    "precio": 890,
    "stock": 150,
    "imagen_url": "https://ejemplo.com/fideo.jpg",
    "categoria_id": 5,
    "categoria": "Despensa",
    "created_at": "...",
    "updated_at": "..."
  }
]
```

`precio` se parsea a float via DTO antes de responder.

### `GET /api/products/categories`

Lista de categorias.

```json
[
  { "id": 5, "nombre": "Despensa" },
  { "id": 6, "nombre": "Lacteos y Huevos" }
]
```

### `GET /api/products/category/:id`

Productos filtrados por categoria. Misma estructura que `GET /products`.

### `GET /api/products/:id`

Producto individual.

### `POST /api/products`

Crear producto.

**Body:**
```json
{
  "nombre": "Leche Entera",
  "descripcion": "Leche entera 1 litro",
  "precio": 1290,
  "stock": 200,
  "imagen_url": "https://ejemplo.com/leche.jpg",
  "categoria_id": 6
}
```

**Validaciones:** nombre requerido, precio > 0, stock >= 0

**Response 201:** Producto creado + emite Socket.io `product:created`

### `PUT /api/products/:id`

Actualizar producto. Misma validacion y estructura que POST + emite `product:updated`.

### `DELETE /api/products/:id`

Elimina producto. Emite `product:deleted`.

```json
{ "message": "Producto eliminado exitosamente", "product": { "id": 1, "nombre": "Fideo Espiral" } }
```

---

## Eventos Socket.io

| Evento | Payload | Cuando ocurre |
|--------|---------|---------------|
| `product:created` | Producto completo | POST /api/products |
| `product:updated` | Producto actualizado | PUT /api/products/:id |
| `product:deleted` | `{ id }` | DELETE /api/products/:id |

Socket.io corre en el mismo puerto (5000) sobre el servidor HTTP de Express. Sin autenticacion — cualquier cliente conectado recibe los eventos.
