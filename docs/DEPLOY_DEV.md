# Despliegue en Entorno DEV (Servidor Universidad)

Guía para desplegar **Cloud Catalog** en el servidor de la universidad (`192.168.50.23`) bajo el usuario `icin` en la carpeta `/home/icin/app/dev`.

**Puertos objetivo:**
- Backend API + Socket.io → **5000**
- Frontend (Vite dev server) → **3000**
- Nginx reverse proxy expone puertos 80/443 y enruta:
  - `/api/*` y `/socket.io/*` → `http://localhost:5000`
  - resto → `http://localhost:3000`

---

## 1. Requisitos en el servidor

| Herramienta | Versión | Cómo instalar |
|-------------|---------|---------------|
| Node.js | 18+ | `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs` |
| pnpm | 8+ | `corepack enable && corepack prepare pnpm@latest --activate` |
| PostgreSQL | 16+ | `sudo apt-get install -y postgresql postgresql-contrib` |
| Nginx | — | `sudo apt-get install -y nginx` |
| pm2 (gestor de procesos) | — | `sudo npm i -g pm2` |
| Git | — | `sudo apt-get install -y git` |

---

## 2. Preparar la base de datos en el servidor

```bash
# Conectar por SSH
ssh icin@192.168.50.23

# Crear base de datos y usuario (si no existe)
sudo -u postgres psql -c "CREATE DATABASE cloud_catalog_dev;"
sudo -u postgres psql -c "CREATE USER icin WITH PASSWORD 'Icin2026';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cloud_catalog_dev TO icin;"
```

---

## 3. Clonar / actualizar el repositorio en `/home/icin/app/dev`

```bash
cd /home/icin/app
# Si ya existe la carpeta dev, hacer pull; si no, clonar
if [ -d dev ]; then
  cd dev && git pull
else
  git clone <URL_DEL_REPO> dev
  cd dev
fi
```

---

## 4. Variables de entorno para DEV

```bash
cd /home/icin/app/dev/backend
cp .env.example .env.dev
```

Edita `backend/.env.dev`:

```ini
PORT=5000
DB_USER=icin
DB_PASSWORD=Icin2026
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cloud_catalog_dev
JWT_SECRET=dev_secret_cambia_en_produccion
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

> **Importante:** El backend escucha en `PORT=5000`. El frontend Vite dev server corre en `3000` (configurado en `vite.config.js` o variable `VITE_PORT`).

---

## 5. Instalar dependencias

```bash
# Backend
cd /home/icin/app/dev/backend
pnpm install

# Frontend
cd /home/icin/app/dev/frontend
pnpm install
```

---

## 6. Resetear / migrar base de datos (DEV)

```bash
cd /home/icin/app/dev/backend
# Usa el archivo .env.dev
cp .env.dev .env
pnpm run db:reset
# Al terminar, vuelve a poner .env.dev como .env si lo necesitas
cp .env.dev .env
```

---

## 7. Configurar Nginx (reverse proxy) para DEV

Crea `/etc/nginx/sites-available/cloud-catalog-dev` (requiere `sudo`):

```nginx
server {
    listen 80;
    server_name dev.tudominio.edu;   # o la IP 192.168.50.23

    # Frontend (Vite dev server)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API + Socket.io
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Habilita y recarga:

```bash
sudo ln -sf /etc/nginx/sites-available/cloud-catalog-dev /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 8. Iniciar servicios con pm2 (DEV)

```bash
cd /home/icin/app/dev

# Backend
cd backend
pm2 start --name "cloud-catalog-dev-backend" \
  --interpreter node -- node server.js \
  --env production   # NODE_ENV=production para que use .env (puerto 5000)

# Frontend (Vite dev server)
cd ../frontend
pm2 start --name "cloud-catalog-dev-frontend" \
  --interpreter pnpm -- run dev \
  -- --port 3000 --host 0.0.0.0

# Guardar procesos pm2 para que sobrevivan a reinicios
pm2 save
pm2 startup  # ejecuta el comando que te muestra como root
```

Verifica:

```bash
pm2 list
pm2 logs cloud-catalog-dev-backend
pm2 logs cloud-catalog-dev-frontend
```

---

## 9. Acceso al entorno DEV

| Servicio | URL (a través de Nginx) |
|----------|--------------------------|
| Frontend | http://dev.tudominio.edu (o http://192.168.50.23) |
| API Healthcheck | http://dev.tudominio.edu/api/health |
| Socket.io | ws://dev.tudominio.edu/socket.io/ |

Credenciales de prueba (tras `db:reset`):
- Admin: `admin` / `123456`
- Cliente: `test` / `123456`

---

## 10. Comandos útiles en DEV

| Acción | Comando |
|--------|---------|
| Ver logs backend | `pm2 logs cloud-catalog-dev-backend` |
| Ver logs frontend | `pm2 logs cloud-catalog-dev-frontend` |
| Reiniciar backend | `pm2 restart cloud-catalog-dev-backend` |
| Reiniciar frontend | `pm2 restart cloud-catalog-dev-frontend` |
| Resetear BD dev | `cd /home/icin/app/dev/backend && cp .env.dev .env && pnpm run db:reset && cp .env.dev .env` |
| Actualizar código y reiniciar | `cd /home/icin/app/dev && git pull && pm2 restart all` |

---

## 11. Estructura de carpetas en el servidor

```
/home/icin/app/
├── dev/
│   ├── backend/          # Express + Socket.io (puerto 5000)
│   ├── frontend/         # Vue + Vite (puerto 3000)
│   └── database/         # Scripts SQL
└── prod/                 # (ver DEPLOY_PROD.md)
```

---

## 12. Notas importantes

- **Nginx** termina SSL si configuras certificados (Let's Encrypt recomendado para dominios reales).
- El frontend en DEV usa **Vite dev server** (hot-reload). En PROD se sirve estático desde `backend/dist`.
- `pnpm run db:reset` **borra todos los datos** de `cloud_catalog_dev`. Úsalo solo cuando quieras partir de cero.
- Los archivos `.env.dev` y `.env.prod` **no se versionan**; cada entorno tiene el suyo.