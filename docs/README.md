# Cloud Catalog - Documentacion del Proyecto

## Descripcion General

**Cloud Catalog** es una aplicacion web full-stack para gestionar un catalogo de productos de una tienda de abarrotes (supermercado). Permite a los usuarios ver productos, y a administradores/empleados gestionar el catalogo en tiempo real.

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 19, Vite, React Router, Axios, Socket.io-client |
| Backend | Express 5, Node.js, Socket.io, JWT, bcrypt |
| Base de datos | PostgreSQL (pg) |
| Gestor de paquetes | pnpm |
| Autenticacion | JWT (JSON Web Tokens) |
| Tiempo real | Socket.io |

## Arquitectura

```
cloudcatalog/
├── backend/                  # API REST + WebSocket
│   ├── server.js            # Entry point Express 5
│   ├── .env                 # Variables de entorno
│   └── src/
│       ├── config/          # Conexion DB
│       ├── middlewares/     # JWT + RBAC
│       ├── models/          # Queries SQL puras
│       ├── services/        # Logica de negocio
│       ├── controllers/     # HTTP handlers + Socket.io
│       └── routes/          # Definicion de endpoints
├── frontend/                # SPA React
│   ├── vite.config.js       # Config Vite + proxy
│   └── src/
│       ├── App.jsx          # Componente raiz
│       ├── index.css        # Estilos globales (#90ee90)
│       ├── routes/          # React Router
│       ├── services/        # API calls (Axios)
│       └── pages/           # 4 paginas principales
├── database/
│   └── scripts/             # SQL: ENUM, tablas, seeds
└── docs/                    # Esta documentacion
```

## Puertos

| Servicio | Puerto |
|----------|--------|
| Backend (produccion) | 5000 |
| Frontend (Vite dev) | 3000 |
| PostgreSQL | 5432 |

## Permisos por Rol

| Rol | Ver Catalogo | CRUD Productos | Gestionar Usuarios |
|-----|:------------:|:--------------:|:------------------:|
| `cliente` | Si | No | No |
| `empleado` | Si | Si | No |
| `admin` | Si | Si | Si |

## Credenciales de Admin

| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Contrasena | `123456` |
| Rol | `admin` |

## Documentacion

- [API Endpoints](API.md) - Todos los endpoints REST
- [Base de Datos](DATABASE.md) - Schema, tablas y seeds
- [Backend](BACKEND.md) - Arquitectura del servidor
- [Frontend](FRONTEND.md) - Arquitectura del cliente
- [Autenticacion](AUTH.md) - JWT, roles y permisos
- [Despliegue](DEPLOYMENT.md) - Guia de inicio rapido
