# Despliegue Local (Desarrollo)

Guía para ejecutar **Cloud Catalog** en tu máquina local con dos terminales: backend en puerto **3100** y frontend en **5100**.

---

## 1. Requisitos previos

| Herramienta | Versión mínima | Notas |
|-------------|----------------|-------|
| Node.js | 18+ | Incluye `npm` y `npx` |
| **pnpm** | 8+ | `corepack enable && corepack prepare pnpm@latest --activate` |
| PostgreSQL | 16+ | Servidor local o Docker |
| Git | — | Para clonar el repositorio |

> **Nota:** El proyecto usa `pnpm` (no `npm`). Los `package.json` definen scripts con `pnpm run …`.

---

## 2. Clonar el repositorio

```bash
git clone <URL_DEL_REPO>
cd cloud-catalog
```

---

## 3. Configurar la base de datos

### 3.1 Crear la base de datos

```bash
# Windows (PowerShell)
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE cloud_catalog;"

# Linux / macOS
psql -U postgres -c "CREATE DATABASE cloud_catalog;"
```

### 3.2 Variables de entorno del backend

Copia el archivo de ejemplo y ajusta los valores:

```bash
cd backend
cp .env.example .env
```

Edita `backend/.env` con tus credenciales locales:

```ini
PORT=3100
DB_USER=postgres
DB_PASSWORD=tu_password_local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cloud_catalog
JWT_SECRET=secret_local_cambia_en_produccion
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

> **Importante:** `PORT=3100` (el archivo `.env.example` dice 5100, pero el backend corre en 3100).

### 3.3 Ejecutar migraciones / seed (reset completo)

```bash
# Desde la carpeta backend/
pnpm run db:reset
```

Este comando:
1. Elimina tablas y tipos existentes (`productos`, `categorias`, `usuarios`, `rol_usuario`)
2. Ejecuta los 6 scripts SQL en orden:
   - `01_init_roles_usuarios.sql` — ENUM `rol_usuario` + tabla `usuarios`
   - `02_init_categorias_prod.sql` — tablas `categorias` y `productos`
   - `03_seed_tienda.sql` — 4 categorías
   - `04_seed_productos.sql` — 11 productos
   - `05_seed_admin.sql` — usuario `admin` / `123456` (rol admin)
   - `06_add_color_favorito.sql` — columna `color_favorito` para recuperación de contraseña
3. Imprime credenciales de prueba al finalizar.

---

## 4. Instalar dependencias

```bash
# Terminal 1 – Backend
cd backend
pnpm install

# Terminal 2 – Frontend
cd frontend
pnpm install
```

---

## 5. Iniciar en modo desarrollo

### Terminal 1 – Backend (puerto 3100)

```bash
cd backend
pnpm run dev
# ✔ nodemon watching → http://localhost:3100
# ✔ Socket.io activo
```

### Terminal 2 – Frontend (puerto 5100)

```bash
cd frontend
pnpm run dev
# ✔ Vite → http://localhost:5100
# Proxy configurado: /api y /socket.io → http://localhost:3100
```

---

## 6. Verificar

| Servicio | URL |
|----------|-----|
| Frontend (catálogo) | http://localhost:5100 |
| API Healthcheck | http://localhost:3100/api/health |
| Credenciales admin | `admin` / `123456` |
| Credenciales cliente | `test` / `123456` |

---

## 7. Comandos útiles

| Acción | Comando |
|--------|---------|
| Resetear BD completa | `cd backend && pnpm run db:reset` |
| Ver logs backend | `cd backend && pnpm run dev` |
| Ver logs frontend | `cd frontend && pnpm run dev` |
| Build frontend (para probar prod local) | `cd frontend && pnpm run build` |
| Iniciar backend en modo prod (sirve `frontend/dist`) | `cd backend && pnpm run prod` |

---

## 8. Estructura de puertos local

| Servicio | Puerto | Comando |
|----------|--------|---------|
| Backend API + Socket.io | 3100 | `pnpm run dev` (backend) |
| Frontend Vite dev server | 5100 | `pnpm run dev` (frontend) |
| PostgreSQL | 5432 | (servidor PG) |

---

## 9. Solución de problemas comunes

| Problema | Solución |
|----------|----------|
| `pnpm: command not found` | `corepack enable && corepack prepare pnpm@latest --activate` |
| Error de conexión a PG | Verifica `DB_HOST`, `DB_PORT`, `DB_PASSWORD` en `.env` y que PG acepte conexiones locales (`pg_hba.conf`) |
| Puerto 3100/5100 ocupado | Cambia `PORT` en `backend/.env` o mata el proceso que lo usa |
| Cambios en BD no reflejan | Ejecuta `pnpm run db:reset` de nuevo |
| Socket.io no conecta | Asegúrate de que el proxy de Vite (`vite.config.js`) apunte a `http://localhost:3100` con `ws: true` |