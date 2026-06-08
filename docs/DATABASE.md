# Base de Datos

## Configuracion

| Parametro | Valor |
|-----------|-------|
| Motor | PostgreSQL 18 |
| Nombre | `cloud_catalog` |
| Usuario | `postgres` |
| Contrasena | `123` |
| Puerto | 5432 |

## ENUM: `rol_usuario`

```sql
CREATE TYPE rol_usuario AS ENUM ('cliente', 'empleado', 'admin');
```

---

## Tablas

### `usuarios`

| Columna | Tipo | Constraints |
|---------|------|------------|
| `id` | SERIAL | PRIMARY KEY |
| `nombre` | VARCHAR(100) | NOT NULL |
| `usuario` | VARCHAR(50) | UNIQUE, NOT NULL |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL |
| `password_hash` | VARCHAR(255) | NOT NULL |
| `rol` | rol_usuario | DEFAULT 'cliente' |
| `reset_token` | VARCHAR(255) | nullable |
| `reset_token_expiry` | TIMESTAMP | nullable |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Indices:**
- `idx_usuarios_email` sobre `(email)`
- `idx_usuarios_usuario` sobre `(usuario)`
- `idx_usuarios_rol` sobre `(rol)`

---

### `categorias`

| Columna | Tipo | Constraints |
|---------|------|------------|
| `id` | SERIAL | PRIMARY KEY |
| `nombre` | VARCHAR(100) | UNIQUE, NOT NULL |
| `descripcion` | TEXT | nullable |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Indices:**
- `idx_categorias_nombre` sobre `(nombre)`

---

### `productos`

| Columna | Tipo | Constraints |
|---------|------|------------|
| `id` | SERIAL | PRIMARY KEY |
| `nombre` | VARCHAR(150) | NOT NULL |
| `descripcion` | TEXT | nullable |
| `precio` | DECIMAL(10,2) | NOT NULL, CHECK (precio >= 0) |
| `stock` | INTEGER | DEFAULT 0, CHECK (stock >= 0) |
| `imagen_url` | VARCHAR(500) | nullable |
| `categoria_id` | INTEGER | REFERENCES categorias(id) ON DELETE SET NULL |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**Indices:**
- `idx_productos_categoria` sobre `(categoria_id)`
- `idx_productos_precio` sobre `(precio)`

---

## Diagrama de Relaciones

```
usuarios                  categorias
    |                          |
    |                          |
    |    productos             |
    |   +-----------+          |
    +-->|categoria_id|-------->+
        +-----------+
        |    id     |
        |  nombre   |
        |  precio   |
        |  stock    |
        | imagen_url|
        +-----------+
```

- `productos.categoria_id` -> `categorias.id` (ON DELETE SET NULL)

---

## Scripts SQL

### Scripts de inicializacion (en orden)

| Script | Descripcion |
|--------|-------------|
| `01_init_roles_usuarios.sql` | Crea ENUM `rol_usuario`, tabla `usuarios` con indices |
| `02_init_categorias_prod.sql` | Crea tablas `categorias` y `productos` con indices |
| `03_seed_tienda.sql` | Elimina datos existentes, inserta 4 categorias de supermercado |
| `04_seed_productos.sql` | Inserta 11 productos de supermercado con URLs de imagenes |
| `05_seed_admin.sql` | Inserta usuario administrador (admin/123456) |

### Ejecucion de scripts

```powershell
$env:PGPASSWORD = "123"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE cloud_catalog;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/01_init_roles_usuarios.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/02_init_categorias_prod.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/03_seed_tienda.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/04_seed_productos.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/05_seed_admin.sql
```

---

## Datos Semilla

### Categorias (supermercado)

| ID | Nombre |
|----|--------|
| 5 | Despensa |
| 6 | Lacteos y Huevos |
| 7 | Limpieza |
| 8 | Panaderia |

### Productos (11 items)

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

### Usuario Admin

| Campo | Valor |
|-------|-------|
| nombre | Administrador |
| usuario | admin |
| email | admin@tienda.cl |
| password | 123456 (hash bcrypt) |
| rol | admin |

---

## Formato de Precios

Los precios se almacenan como `DECIMAL(10,2)` en la base de datos pero se muestran en formato de pesos chilenos sin decimales:

```javascript
const formatPrice = (price) => {
    return '$ ' + new Intl.NumberFormat('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};
```

Ejemplo: `$ 1.290`, `$ 3.990`, `$ 690`
