# API Endpoints

Base URL: `http://localhost:5000/api`

## Health Check

### `GET /api/health`

Verifica que el servidor este funcionando.

**Auth:** No requerido

**Response:**
```json
{
  "status": "OK",
  "message": "Cloud Catalog API funcionando",
  "timestamp": "2026-06-07T21:00:00.000Z"
}
```

---

## Autenticacion (`/api/auth`)

### `POST /api/auth/register`

Registra un nuevo usuario.

**Auth:** No requerido

**Body:**
```json
{
  "nombre": "Juan Perez",
  "usuario": "juan",
  "email": "juan@email.com",
  "password": "123456",
  "rol": "cliente"          // opcional, default: "cliente"
}
```

**Validaciones:**
- Todos los campos son requeridos
- Contrasena minimo 6 caracteres
- Usuario y email deben ser unicos

**Response (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 3,
    "nombre": "Juan Perez",
    "usuario": "juan",
    "email": "juan@email.com",
    "rol": "cliente",
    "created_at": "2026-06-07T21:00:00.000Z"
  }
}
```

---

### `POST /api/auth/login`

Inicia sesion y retorna un JWT.

**Auth:** No requerido

**Body:**
```json
{
  "usuario": "admin",
  "password": "123456"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 2,
    "nombre": "Administrador",
    "usuario": "admin",
    "email": "admin@tienda.cl",
    "rol": "admin"
  }
}
```

---

### `POST /api/auth/forgot-password`

Solicita un token de restablecimiento de contrasena.

**Auth:** No requerido

**Body:**
```json
{
  "email": "test@gmail.com"
}
```

**Response:**
```json
{
  "message": "Token de restablecimiento generado",
  "resetToken": "40a16f17ec2645813da0f67571749624..."
}
```

> **Nota:** El token se retorna directamente solo en modo desarrollo. En produccion se enviaria por email.

---

### `POST /api/auth/reset-password`

Restablece la contrasena usando un token.

**Auth:** No requerido

**Body:**
```json
{
  "token": "40a16f17ec2645813da0f67571749624...",
  "newPassword": "nueva1234"
}
```

**Validaciones:**
- Token y newPassword son requeridos
- newPassword minimo 6 caracteres
- Token debe ser valido y no haber expirado (1 hora)

**Response:**
```json
{
  "message": "Contrasena actualizada exitosamente"
}
```

---

## Usuarios (`/api/users`)

> Todos los endpoints requieren autenticacion JWT + rol `admin`.

### `GET /api/users`

Lista todos los usuarios.

**Auth:** `admin`

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Test",
    "usuario": "T",
    "email": "test@gmail.com",
    "rol": "cliente",
    "created_at": "2026-06-07T20:00:00.000Z"
  },
  {
    "id": 2,
    "nombre": "Administrador",
    "usuario": "admin",
    "email": "admin@tienda.cl",
    "rol": "admin",
    "created_at": "2026-06-07T20:00:00.000Z"
  }
]
```

---

### `GET /api/users/stats`

Retorna conteo de usuarios por rol.

**Auth:** `admin`

**Response:**
```json
[
  { "rol": "admin", "total": "1" },
  { "rol": "cliente", "total": "1" },
  { "rol": "empleado", "total": "0" }
]
```

---

### `GET /api/users/:id`

Obtiene un usuario por ID.

**Auth:** `admin`

**Response:**
```json
{
  "id": 1,
  "nombre": "Test",
  "usuario": "T",
  "email": "test@gmail.com",
  "rol": "cliente",
  "created_at": "2026-06-07T20:00:00.000Z"
}
```

---

### `PUT /api/users/:id/role`

Actualiza el rol de un usuario.

**Auth:** `admin`

**Body:**
```json
{
  "rol": "empleado"
}
```

**Roles validos:** `cliente`, `empleado`, `admin`

**Response:**
```json
{
  "id": 1,
  "nombre": "Test",
  "usuario": "T",
  "email": "test@gmail.com",
  "rol": "empleado",
  "created_at": "2026-06-07T20:00:00.000Z"
}
```

---

### `DELETE /api/users/:id`

Elimina un usuario.

**Auth:** `admin`

**Response:**
```json
{
  "id": 1,
  "nombre": "Test",
  "usuario": "T",
  "email": "test@gmail.com",
  "rol": "cliente"
}
```

---

## Productos (`/api/products`)

### `GET /api/products`

Obtiene todos los productos con el nombre de su categoria.

**Auth:** No requerido

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Fideo Espiral",
    "descripcion": "Fideo espiral 500g ideal para ensaladas y guisos",
    "precio": "890",
    "stock": 150,
    "imagen_url": "https://ejemplo.com/fideo.jpg",
    "categoria_id": 5,
    "categoria": "Despensa",
    "created_at": "2026-06-07T20:00:00.000Z"
  }
]
```

---

### `GET /api/products/categories`

Lista todas las categorias ordenadas por nombre.

**Auth:** No requerido

**Response:**
```json
[
  { "id": 5, "nombre": "Despensa" },
  { "id": 6, "nombre": "Lacteos y Huevos" },
  { "id": 7, "nombre": "Limpieza" },
  { "id": 8, "nombre": "Panaderia" }
]
```

---

### `GET /api/products/category/:id`

Obtiene productos filtrados por categoria.

**Auth:** No requerido

**Response:** Misma estructura que `GET /api/products`.

---

### `GET /api/products/:id`

Obtiene un producto por ID.

**Auth:** No requerido

**Response:** Objeto producto individual.

---

### `POST /api/products`

Crea un nuevo producto.

**Auth:** `empleado` o `admin`

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

**Validaciones:**
- `nombre` es requerido
- `precio` debe ser > 0
- `stock` debe ser >= 0

**Response (201):** Producto creado + evento Socket.io `product:created`

---

### `PUT /api/products/:id`

Actualiza un producto existente.

**Auth:** `empleado` o `admin`

**Body:** Misma estructura que POST.

**Response:** Producto actualizado + evento Socket.io `product:updated`

---

### `DELETE /api/products/:id`

Elimina un producto.

**Auth:** `empleado` o `admin`

**Response:**
```json
{
  "id": 1,
  "nombre": "Fideo Espiral"
}
```

+ Evento Socket.io `product:deleted` con payload `{ id }`

---

## Eventos Socket.io

| Evento | Direccion | Payload | Descripcion |
|--------|-----------|---------|-------------|
| `product:created` | Server -> Client | Producto completo | Nuevo producto creado |
| `product:updated` | Server -> Client | Producto actualizado | Producto modificado |
| `product:deleted` | Server -> Client | `{ id }` | Producto eliminado |

> **Nota:** Socket.io no tiene autenticacion. Cualquier cliente conectado recibe los eventos de productos.
