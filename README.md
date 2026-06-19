# Cloud Catalog

Aplicación web full-stack para gestionar un catálogo de productos de una tienda de abarrotes (supermercado). Consta de un backend en Express con PostgreSQL y un frontend en Vue 3 con Vite.

## Stack

- **Frontend:** Vue 3, Vite, Vue Router, Pinia, Axios, Socket.io-client
- **Backend:** Express 5, PostgreSQL, Socket.io, JWT, bcrypt
- **Base de datos:** PostgreSQL

## Funcionalidades

- Catálogo público de productos con filtro por categorías
- CRUD de productos en tiempo real (Socket.io)
- Gestión de usuarios con roles (cliente, empleado, admin)
- Autenticación JWT
- Precios en pesos chilenos

## Inicio Rápido (desarrollo)

### 1. Requisitos

- Node.js 18+
- pnpm
- PostgreSQL 16+

### 2. Configurar base de datos

```powershell
# Crear la base de datos (si no existe)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE cloud_catalog;"

# Opción A — Script por script
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/01_init_roles_usuarios.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/02_init_categorias_prod.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/03_seed_tienda.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/04_seed_productos.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/05_seed_admin.sql
```

### 3. Instalar dependencias e iniciar

```powershell
# Terminal 1 — Backend (puerto 3100)
cd backend
pnpm install
pnpm run dev

# Terminal 2 — Frontend (puerto 5100)
cd frontend
pnpm install
pnpm run dev
```

Abrir en el navegador: **http://localhost:5100**

### 4. Reset rápido de la base de datos (opcional)

```powershell
cd backend
pnpm run db:reset
```

## Producción

```powershell
# 1. Construir frontend
cd frontend
pnpm install
pnpm run build

# 2. Iniciar backend (sirve los estáticos del frontend)
cd backend
pnpm install
pnpm run prod
```

Abrir en el navegador: **http://localhost:3100**

## Puertos

| Servicio  | Desarrollo | Producción |
|-----------|-----------|------------|
| Backend   | `:3100`   | `:3100`    |
| Frontend  | `:5100`   | Sirve desde el backend (`:3100`) |

## Credenciales Admin

| Campo       | Valor    |
|-------------|----------|
| Usuario     | `admin`  |
| Contraseña  | `123456` |

## Documentación

Ver carpeta [`docs/`](docs/) para documentación detallada:
- [`API.md`](docs/API.md) — Endpoints REST
- [`ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Arquitectura del proyecto
- [`DATABASE.md`](docs/DATABASE.md) — Modelo de datos
- [`DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Guía de despliegue

## Licencia

MIT
