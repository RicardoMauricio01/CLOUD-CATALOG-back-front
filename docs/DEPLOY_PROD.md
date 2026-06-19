# Despliegue en Entorno PROD (Servidor Universidad)

Guía para desplegar **Cloud Catalog** en el servidor de la universidad (`192.168.50.23`) bajo el usuario `icin` en la carpeta `/home/icin/app/prod`.

**Puertos objetivo:**
- Backend API + Socket.io + Frontend estático → **5501**
- Frontend build servido por Express (no Vite dev server)
- Nginx reverse proxy expone puertos 80/443 y enruta:
  - `/api/*` y `/socket.io/*` → `http://localhost:5501`
  - resto (archivos estáticos + SPA fallback) → `http://localhost:5501`

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
sudo -u postgres psql -c "CREATE DATABASE cloud_catalog_prod;"
sudo -u postgres psql -c "CREATE USER icin WITH PASSWORD 'Icin2026';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cloud_catalog_prod TO icin;"
```

---

## 3. Clonar / actualizar el repositorio en `/home/icin/app/prod`

```bash
cd /home/icin/app
# Si ya existe la carpeta prod, hacer pull; si no, clonar
if [ -d prod ]; then
  cd prod && git pull
else
  git clone <URL_DEL_REPO> prod
  cd prod
fi
```

---

## 4. Variables de entorno para PROD

```bash
cd /home/icin/app/prod/backend
cp .env.example .env.prod
```

Edita `backend/.env.prod`:

```ini
PORT=5501
DB_USER=icin
DB_PASSWORD=Icin2026
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cloud_catalog_prod
JWT_SECRET=prod_secret_muy_largo_y_seguro_cambia_esto
JWT_EXPIRES_IN=24h
NODE_ENV=production
```

> **Importante:** En producción el backend sirve **tanto la API como el frontend build** (`frontend/dist`). Por eso un solo puerto `5501`.

---

## 5. Instalar dependencias y construir frontend

```bash
# Backend
cd /home/icin/app/prod/backend
pnpm install

# Frontend – instalar y hacer build de producción
cd /home/icin/app/prod/frontend
pnpm install
pnpm run build
# Genera /home/icin/app/prod/frontend/dist
```

El backend está configurado (`server.js` líneas 70-81) para servir `frontend/dist` como archivos estáticos y hacer SPA fallback a `index.html`.

---

## 6. Resetear / migrar base de datos (PROD)

```bash
cd /home/icin/app/prod/backend
# Usa el archivo .env.prod
cp .env.prod .env
pnpm run db:reset
# Al terminar, vuelve a poner .env.prod como .env
cp .env.prod .env
```

⚠️ **Advertencia:** `db:reset` **borra todos los datos** de `cloud_catalog_prod`. Ejecútalo solo en la primera instalación o cuando quieras partir de cero. En despliegues posteriores **no** lo corras; usa migraciones manuales si cambias el esquema.

---

## 7. Configurar Nginx (reverse proxy) para PROD

Crea `/etc/nginx/sites-available/cloud-catalog-prod` (requiere `sudo`):

```nginx
server {
    listen 80;
    server_name catalog.tudominio.edu;   # dominio real o IP 192.168.50.23

    # Todo el tráfico va al backend (puerto 5501)
    # El backend sirve API, Socket.io y archivos estáticos del frontend
    location / {
        proxy_pass http://localhost:5501;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket (Socket.io) – mismo upstream
    location /socket.io/ {
        proxy_pass http://localhost:5501;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Habilita y recarga:

```bash
sudo ln -sf /etc/nginx/sites-available/cloud-catalog-prod /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

> **Opcional – HTTPS con Let's Encrypt:**
> ```bash
> sudo apt-get install -y certbot python3-certbot-nginx
> sudo certbot --nginx -d catalog.tudominio.edu
> ```

---

## 8. Iniciar backend con pm2 (PROD)

```bash
cd /home/icin/app/prod/backend

# Asegúrate de que .env apunte a .env.prod
cp .env.prod .env

# Iniciar con pm2
pm2 start --name "cloud-catalog-prod" \
  --interpreter node -- node server.js

# Guardar para reinicios
pm2 save
pm2 startup  # ejecuta el comando que te muestra como root
```

Verifica:

```bash
pm2 list
pm2 logs cloud-catalog-prod
curl http://localhost:5501/api/health
```

---

## 9. Acceso al entorno PROD

| Servicio | URL (a través de Nginx) |
|----------|--------------------------|
| Frontend (catálogo) | http://catalog.tudominio.edu (o http://192.168.50.23) |
| API Healthcheck | http://catalog.tudominio.edu/api/health |
| Socket.io | ws://catalog.tudominio.edu/socket.io/ |

Credenciales de prueba (tras `db:reset` inicial):
- Admin: `admin` / `123456`
- Cliente: `test` / `123456`

---

## 10. Despliegue continuo (actualizar código en PROD)

```bash
#!/usr/bin/env bash
# deploy-prod-update.sh  –  colocar en /home/icin/app/prod/ y dar permisos +x
set -e

cd /home/icin/app/prod

echo "🔄 Actualizando código..."
git pull

echo "📦 Instalando dependencias backend..."
cd backend
pnpm install

echo "📦 Instalando dependencias frontend y construyendo..."
cd ../frontend
pnpm install
pnpm run build

echo "🔁 Reiniciando backend..."
cd ../backend
pm2 restart cloud-catalog-prod

echo "✅ Despliegue PROD completado"
```

Uso:

```bash
chmod +x /home/icin/app/prod/deploy-prod-update.sh
/home/icin/app/prod/deploy-prod-update.sh
```

---

## 11. Comandos útiles en PROD

| Acción | Comando |
|--------|---------|
| Ver logs | `pm2 logs cloud-catalog-prod` |
| Reiniciar | `pm2 restart cloud-catalog-prod` |
| Ver estado | `pm2 status` |
| Resetear BD (solo primera vez) | `cd /home/icin/app/prod/backend && cp .env.prod .env && pnpm run db:reset && cp .env.prod .env` |
| Actualizar y reiniciar | `/home/icin/app/prod/deploy-prod-update.sh` |

---

## 12. Estructura de carpetas en el servidor

```
/home/icin/app/
├── dev/                  # (ver DEPLOY_DEV.md)
└── prod/
    ├── backend/          # Express + Socket.io + static frontend (puerto 5501)
    ├── frontend/         # Vue + Vite (solo para build)
    │   └── dist/         # Generado por pnpm run build
    └── database/         # Scripts SQL
```

---

## 13. Checklist de producción

- [ ] `NODE_ENV=production` en `.env.prod`
- [ ] `JWT_SECRET` único y largo (≥32 caracteres aleatorios)
- [ ] Base de datos `cloud_catalog_prod` creada y accesible
- [ ] Frontend construido (`pnpm run build` genera `frontend/dist`)
- [ ] Nginx configurado y recargado
- [ ] pm2 gestionando el proceso `cloud-catalog-prod`
- [ ] `pm2 save` y `pm2 startup` ejecutados
- [ ] HTTPS configurado (Certbot) si hay dominio real
- [ ] Backups automáticos de PostgreSQL programados (`pg_dump` + cron)

---

## 14. Diferencias clave DEV vs PROD

| Aspecto | DEV | PROD |
|---------|-----|------|
| Frontend | Vite dev server (puerto 3000, HMR) | Build estático servido por Express (puerto 5501) |
| Backend puerto | 5000 | 5501 |
| Nginx upstream | Dos upstreams (3000 y 5000) | Un solo upstream (5501) |
| `NODE_ENV` | `development` | `production` |
| `db:reset` | Frecuente para pruebas | **Solo una vez** (primera instalación) |
| Logs | `pm2 logs` separados | `pm2 logs` único proceso |