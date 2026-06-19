# Base de Datos

## Configuracion

| Parametro | Valor |
|-----------|-------|
| Motor | PostgreSQL 18 |
| Nombre | `cloud_catalog` |
| Usuario | `postgres` |
| Password | `123` |
| Puerto | 5432 |

## ENUM: `rol_usuario`

```sql
CREATE TYPE rol_usuario AS ENUM ('cliente', 'empleado', 'admin');
```

## Tablas

### `usuarios`

| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | SERIAL | PRIMARY KEY |
| `nombre` | VARCHAR(100) | NOT NULL |
| `usuario` | VARCHAR(50) | UNIQUE, NOT NULL |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL |
| `password_hash` | VARCHAR(255) | NOT NULL |
| `rol` | rol_usuario | DEFAULT 'cliente' |
| `color_favorito` | VARCHAR(100) | nullable |
| `reset_token` | VARCHAR(255) | nullable |
| `reset_token_expiry` | TIMESTAMP | nullable |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

Indices: `idx_usuarios_email` (email), `idx_usuarios_usuario` (usuario), `idx_usuarios_rol` (rol)

### `categorias`

| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | SERIAL | PRIMARY KEY |
| `nombre` | VARCHAR(100) | UNIQUE, NOT NULL |
| `descripcion` | TEXT | nullable |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

Indice: `idx_categorias_nombre` (nombre)

### `productos`

| Columna | Tipo | Constraints |
|---------|------|-------------|
| `id` | SERIAL | PRIMARY KEY |
| `nombre` | VARCHAR(150) | NOT NULL |
| `descripcion` | TEXT | nullable |
| `precio` | DECIMAL(10,2) | NOT NULL, CHECK (precio >= 0) |
| `stock` | INTEGER | DEFAULT 0, CHECK (stock >= 0) |
| `imagen_url` | VARCHAR(500) | nullable |
| `categoria_id` | INTEGER | REFERENCES categorias(id) ON DELETE SET NULL |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

Indices: `idx_productos_categoria` (categoria_id), `idx_productos_precio` (precio)

## Relaciones

```
categorias (1) ---< (N) productos
```

`productos.categoria_id` → `categorias.id` con `ON DELETE SET NULL` (si se borra una categoria, los productos quedan sin categoria).

## Scripts SQL (ejecutar en orden)

| Script | Descripcion |
|--------|-------------|
| `01_init_roles_usuarios.sql` | Crea ENUM `rol_usuario` y tabla `usuarios` con indices |
| `02_init_categorias_prod.sql` | Crea tablas `categorias` y `productos` con indices |
| `03_seed_tienda.sql` | Inserta 4 categorias de supermercado |
| `04_seed_productos.sql` | Inserta 11 productos con URLs de imagenes |
| `05_seed_admin.sql` | Inserta usuario admin con hash bcrypt de `123456` |
| `06_add_color_favorito.sql` | Agrega columna `color_favorito` a `usuarios` para recuperacion de contrasena |

### Reset rapido via backend

```bash
cd backend
pnpm run db:reset
# Ejecuta node db-reset.js que suelta tablas y corre los 6 scripts
```

## Datos semilla

### Categorias

| ID | Nombre |
|----|--------|
| 1 | Despensa |
| 2 | Lacteos y Huevos |
| 3 | Limpieza |
| 4 | Panaderia |

### Productos (11)

| ID | Nombre | Precio | Categoria |
|----|--------|--------|-----------|
| 1 | Fideo Espiral | $890 | Despensa |
| 2 | Arroz Grano Largo | $1.290 | Despensa |
| 3 | Aceite de Girasol | $2.490 | Despensa |
| 4 | Harina de Trigo | $690 | Despensa |
| 5 | Salsa de Tomate | $790 | Despensa |
| 6 | Leche Entera | $1.090 | Lacteos y Huevos |
| 7 | Queso Gauda | $3.990 | Lacteos y Huevos |
| 8 | Bandeja de Huevos x12 | $3.490 | Lacteos y Huevos |
| 9 | Detergente Liquido | $2.190 | Limpieza |
| 10 | Lavaloza Concentrado | $1.590 | Limpieza |
| 11 | Pan de Molde Blanco | $1.490 | Panaderia |

### Usuarios

| Usuario | Password | Rol | Email |
|---------|----------|-----|-------|
| `admin` | `123456` | admin | admin@tienda.cl |
| `test` | `123456` | cliente | test@gmail.com |

## Formato de precios

Almacenados como `DECIMAL(10,2)` en DB. El frontend los muestra en pesos chilenos sin decimales:

```js
new Intl.NumberFormat('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(precio)
```

Ejemplo: `$ 1.290`, `$ 3.990`, `$ 690`
