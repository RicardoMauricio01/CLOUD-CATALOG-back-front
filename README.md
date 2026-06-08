# Cloud Catalog

Aplicacion web full-stack para gestionar un catalogo de productos de una tienda de abarrotes (supermercado).

## Stack

- **Frontend:** React 19, Vite, React Router, Axios, Socket.io-client
- **Backend:** Express 5, PostgreSQL, Socket.io, JWT, bcrypt
- **Base de datos:** PostgreSQL

## Funcionalidades

- Catalogo publico de productos con filtro por categorias
- CRUD de productos en tiempo real (Socket.io)
- Gestion de usuarios con roles (cliente, empleado, admin)
- Autenticacion JWT con recuperacion de contrasena
- Precios en pesos chilenos

## Inicio Rapido

```bash
# Instalar dependencias
cd backend && pnpm install
cd ../frontend && pnpm install

# Configurar base de datos
$env:PGPASSWORD = "123"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE cloud_catalog;"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/01_init_roles_usuarios.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/02_init_categorias_prod.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/03_seed_tienda.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/04_seed_productos.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/05_seed_admin.sql

# Ejecutar en desarrollo
cd backend && pnpm dev    # Puerto 5000
cd frontend && pnpm dev   # Puerto 3000
```

## Credenciales Admin

| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Contrasena | `123456` |

## Documentacion

Ver carpeta [`docs/`](docs/) para documentacion detallada.

## Licencia

MIT
