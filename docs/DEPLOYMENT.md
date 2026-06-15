# Guia de Despliegue

## Requisitos

- Node.js 18+
- pnpm (npm install -g pnpm)
- PostgreSQL 18

## Instalacion

### 1. Clonar e instalar dependencias

```bash
git clone <url>
cd cloudcatalog

cd backend
pnpm install

cd ../frontend
pnpm install
```

### 2. Crear base de datos

```powershell
$env:PGPASSWORD = "123"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE cloud_catalog;"
```

### 3. Ejecutar scripts SQL

```powershell
$scripts = @(
    "database/scripts/01_init_roles_usuarios.sql",
    "database/scripts/02_init_categorias_prod.sql",
    "database/scripts/03_seed_tienda.sql",
    "database/scripts/04_seed_productos.sql",
    "database/scripts/05_seed_admin.sql"
)
foreach ($s in $scripts) {
    & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d cloud_catalog -f $s
}
```

O via el comando integrado:

```bash
cd backend
pnpm run db:reset
```

### 4. Verificar `.env`

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

## Desarrollo (dos terminales)

```bash
# Terminal 1: Backend
cd backend
pnpm dev         # http://localhost:5000 (nodemon)

# Terminal 2: Frontend
cd frontend
pnpm dev         # http://localhost:3000 (Vite, proxy a :5000)
```

## Produccion

```bash
# 1. Construir frontend
cd frontend
pnpm build       # genera frontend/dist/

# 2. Iniciar backend (sirve los estaticos)
cd backend
pnpm prod        # NODE_ENV=production node server.js
# http://localhost:5000
```

## Credenciales

| Usuario | Password | Rol |
|---------|----------|-----|
| `admin` | `123456` | admin |
| `test` | `123456` | cliente |

## Comandos utiles

```bash
# Resetear BD a datos de ejemplo
cd backend && pnpm run db:reset

# Construir frontend
cd frontend && pnpm build
```

## Troubleshooting

### Puerto 5000 en uso

```powershell
$proc = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($proc) { Stop-Process -Id $proc.OwningProcess -Force }
```

### Frontend no conecta al backend

Verificar `frontend/vite.config.js`:

```js
proxy: {
    '/api': { target: 'http://localhost:5000', changeOrigin: true },
    '/socket.io': { target: 'http://localhost:5000', ws: true }
}
```

### Error de columna en reset-password

Asegurar que `authService.forgotPassword` use `.toISOString()`:

```js
const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString();
```

### Error de build en frontend

```bash
cd frontend
pnpm build
# Ver salida. 0 errores = OK.
```
