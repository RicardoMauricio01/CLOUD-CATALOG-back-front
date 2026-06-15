# Cloud Catalog

Aplicacion web full-stack para gestionar un catalogo de productos de una tienda de abarrotes con autenticacion por roles y actualizaciones en tiempo real.

## Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | Vue 3, Vite 6, Pinia, Vue Router 4, Axios, Socket.io-client |
| Backend | Express 5, Node.js, Socket.io 4, JWT, bcrypt |
| Base de datos | PostgreSQL 18 (pg) |
| Tiempo real | Socket.io (WebSocket) |
| Paquetes | pnpm (monorepo sin raiz) |

## Estructura del proyecto

```
cloudcatalog/
├── backend/                  # API REST + WebSocket
│   ├── server.js            # Entry point (Express 5)
│   ├── .env                 # Variables de entorno
│   ├── config/db.js         # Pool PostgreSQL
│   ├── routes/              # authRoutes, userRoutes, productRoutes
│   ├── controllers/         # HTTP handlers + validacion
│   ├── services/            # Logica de negocio (bcrypt, JWT)
│   ├── dao/                 # Queries SQL (Data Access Objects)
│   ├── dtos/                # Transformacion de datos (publicUser, productResponse)
│   └── middlewares/         # JWT + RBAC
├── frontend/                # SPA Vue 3
│   ├── vite.config.js       # Proxy /api -> :5000
│   └── src/
│       ├── main.js          # Entry point (createApp + Pinia + Router)
│       ├── App.vue          # Componente raiz (NavBar + router-view)
│       ├── assets/styles.css # Estilos globales
│       ├── router/          # Vue Router con guards por rol
│       ├── services/        # http.js (axios) + authService, userService, productService
│       ├── state/           # Pinia store (appState.js)
│       └── presentation/    # Vistas agrupadas por feature
├── database/scripts/        # SQL: 01..05 (init + seed)
└── docs/                    # Documentacion
```

## Puertos

| Servicio | Puerto |
|----------|--------|
| Backend | 5000 |
| Frontend (dev) | 3000 |
| PostgreSQL | 5432 |

## Roles y permisos

| Rol | Ver catalogo | CRUD productos | Gestionar usuarios |
|-----|:------------:|:--------------:|:------------------:|
| `cliente` | Si | No | No |
| `empleado` | Si | Si | No |
| `admin` | Si | Si | Si |

## Credenciales por defecto

| Usuario | Password | Rol |
|---------|----------|-----|
| `admin` | `123456` | admin |
| `test` | `123456` | cliente |

## Docs

- [API](API.md) — Todos los endpoints REST + autenticacion JWT
- [Arquitectura](ARCHITECTURE.md) — Backend (capas) + Frontend (vistas, store, router)
- [Base de Datos](DATABASE.md) — Schema, scripts SQL, datos semilla
- [Despliegue](DEPLOYMENT.md) — Instalacion, configuracion, troubleshooting
