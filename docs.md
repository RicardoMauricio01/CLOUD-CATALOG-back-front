# Historia de Usuario 2: Panel CRUD de Clientes

## Objetivo

Implementar un panel simple y funcional para administrar clientes usando Node.js, Express, PostgreSQL con `pg`, bcrypt y frontend con HTML5 + Vanilla JS.

El CRUD trabaja con la tabla existente:

```sql
usuarios(id, username, password)
```

## Backend

Rutas disponibles:

| Metodo | Endpoint | Descripcion |
| --- | --- | --- |
| GET | `/api/users` | Lista clientes |
| POST | `/api/users` | Crea un cliente con password encriptada |
| PUT | `/api/users/:id` | Actualiza username y opcionalmente password |
| DELETE | `/api/users/:id` | Elimina un cliente por id |

Capas creadas:

| Archivo | Responsabilidad |
| --- | --- |
| `backend/routes/userRoutes.js` | Define las rutas HTTP |
| `backend/controllers/userController.js` | Maneja requests, responses, codigos HTTP y bcrypt |
| `backend/services/userService.js` | Ejecuta SQL puro con `pg` |
| `backend/dtos/userDto.js` | Responde solo `id` y `username`, nunca `password` |
| `backend/config/db.js` | Reutiliza el pool existente |

## Frontend

Archivos creados:

| Archivo | Responsabilidad |
| --- | --- |
| `frontend/usuarios.html` | Vista del panel CRUD de clientes con estilos blanco y verde claro |
| `frontend/usuarios.js` | Logica con `fetch()`, render de tabla, busqueda, crear, editar y eliminar |

## Tabla PostgreSQL necesaria

La tabla puede mantenerse simple:

```sql
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
```

## Como verlo funcionar localmente

1. Instala Node.js en tu laptop.
2. Instala PostgreSQL en tu laptop.
3. Crea una base de datos local, por ejemplo:

```sql
CREATE DATABASE cloudcatalog_local;
```

4. En esa base de datos, crea la tabla:

```sql
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
```

5. Crea un archivo `.env.development` en la raiz del proyecto con tus datos locales:

```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=tu_password_local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cloudcatalog_local
NODE_ENV=development
```

6. Instala dependencias:

```bash
npm install
```

7. Levanta el backend:

```bash
npm run dev
```

8. Prueba que el backend responde:

```txt
http://localhost:3000/api/users
```

9. Abre el frontend:

```txt
C:\Users\ricar\Proyecto\cloudcatalog\frontend\usuarios.html
```

10. Desde el formulario puedes crear, editar y eliminar clientes.

## Nota para servidor UTA

Cuando lo lleves al servidor de la universidad, conserva la misma tabla `usuarios(id, username, password)`. No necesitas columnas adicionales para esta version.
