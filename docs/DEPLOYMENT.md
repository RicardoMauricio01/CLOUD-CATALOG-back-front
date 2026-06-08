# Guia de Despliegue

## Requisitos Previos

- Node.js (v18+)
- pnpm (gestor de paquetes)
- PostgreSQL 18 (o superior)

---

## Instalacion

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd cloudcatalog
```

### 2. Instalar dependencias

```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

### 3. Configurar base de datos

```powershell
# Crear la base de datos
$env:PGPASSWORD = "123"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE cloud_catalog;"

# Ejecutar scripts en orden
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/01_init_roles_usuarios.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/02_init_categorias_prod.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/03_seed_tienda.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/04_seed_productos.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f database/scripts/05_seed_admin.sql
```

### 4. Configurar variables de entorno

Verificar que `backend/.env` tenga los valores correctos:

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

## Ejecutar en Desarrollo

### Terminal 1: Backend

```bash
cd backend
pnpm dev
# Servidor en http://localhost:5000 (nodemon auto-restart)
```

### Terminal 2: Frontend

```bash
cd frontend
pnpm dev
# Vite en http://localhost:3000 (proxy a backend:5000)
```

Abrir http://localhost:3000 en el navegador.

---

## Ejecutar en Produccion

### 1. Construir el frontend

```bash
cd frontend
pnpm build
# Output: frontend/dist/
```

### 2. Iniciar el backend

```bash
cd backend
pnpm start
# Backend sirve frontend/dist como archivos estaticos
```

Abrir http://localhost:5000 en el navegador.

> **Nota:** En Windows, usar `Start-Process` en PowerShell:
> ```powershell
> Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "C:\Users\ricar\Proyecto\cloudcatalog\backend" -WindowStyle Hidden
> ```

---

## Credenciales

### Admin

| Campo | Valor |
|-------|-------|
| URL | http://localhost:5000/login |
| Usuario | `admin` |
| Contrasena | `123456` |

### Test

| Campo | Valor |
|-------|-------|
| Usuario | `T` |
| Contrasena | `test1234` |
| Rol | `cliente` |

---

## Puertos

| Servicio | Puerto |
|----------|--------|
| Backend (produccion) | 5000 |
| Frontend (Vite dev) | 3000 |
| PostgreSQL | 5432 |

---

## Reiniciar el Backend

```powershell
# Matar processos node existentes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Iniciar servidor
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "C:\Users\ricar\Proyecto\cloudcatalog\backend" -WindowStyle Hidden
Start-Sleep -Seconds 3

# Verificar
Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing
```

---

## Estructura de Archivos

```
cloudcatalog/
├── backend/          # API REST + WebSocket (Express 5)
├── frontend/         # SPA React (Vite)
├── database/         # Scripts SQL
├── docs/             # Esta documentacion
└── AGENTS.md         # Instrucciones para agentes AI
```

---

## Troubleshooting

### Error: Puerto 5000 en uso

```powershell
$proc = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($proc) { Stop-Process -Id $proc.OwningProcess -Force; Start-Sleep -Seconds 1 }
```

### Error: "Column type mismatch" en reset-password

Verificar que `auth.service.js` use `.toISOString()` para la fecha:

```javascript
const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString();
```

### Error: Frontend no conecta al backend

Verificar que `vite.config.js` tenga el proxy configurado al puerto correcto:

```javascript
proxy: {
    '/api': { target: 'http://localhost:5000', changeOrigin: true },
    '/socket.io': { target: 'http://localhost:5000', ws: true }
}
```
