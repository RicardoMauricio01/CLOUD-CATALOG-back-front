# Autenticacion y Autorizacion

## Resumen

| Mecanismo | Tecnologia |
|-----------|-----------|
| Autenticacion | JWT (JSON Web Tokens) |
| Hash de contrasenas | bcrypt (10 salt rounds) |
| Autorizacion | Role-Based Access Control (RBAC) |
| Storage del token | localStorage del navegador |

---

## Flujo de Login

```
1. Usuario envia { usuario, password }
2. Backend busca usuario por username (SELECT * FROM usuarios WHERE usuario = $1)
3. Compara password con bcrypt.compare(password, user.password_hash)
4. Si es valido: genera JWT con payload { id, usuario, email, rol }
5. JWT firmado con JWT_SECRET, expira en 24h
6. Retorna { token, user: { id, nombre, usuario, email, rol } }
```

---

## JWT

### Payload

```json
{
  "id": 2,
  "usuario": "admin",
  "email": "admin@tienda.cl",
  "rol": "admin",
  "iat": 1780880044,
  "exp": 1780966444
}
```

### Configuracion

| Campo | Valor |
|-------|-------|
| Secret | `catalog_jwt_secret_key_change_in_production` |
| Expiracion | 24 horas |
| Algoritmo | HS256 (default) |

### Almacenamiento (Frontend)

```javascript
// Guardar
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(userData));

// Leer
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// Limpiar
localStorage.removeItem('token');
localStorage.removeItem('user');
```

---

## Middleware de Autenticacion

### authenticateToken

```javascript
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token invalido o expirado' });
        }
        req.user = user;
        next();
    });
}
```

### requireRole(roles)

```javascript
function requireRole(roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({
                error: `Se requiere uno de estos roles: ${roles.join(', ')}`
            });
        }
        next();
    };
}
```

### Uso en rutas

```javascript
// Solo admin puede gestionar usuarios
router.get('/', authenticateToken, requireRole(['admin']), userController.getAll);

// empleado o admin pueden CRUD productos
router.post('/', authenticateToken, requireRole(['empleado', 'admin']), productController.create);

// Productos publicos (sin auth)
router.get('/', productController.getAll);
```

---

## Roles

### cliente

- Puede ver el catalogo de productos
- No puede crear, editar ni eliminar productos
- No puede gestionar usuarios

### empleado

- Puede ver el catalogo
- Puede crear, editar y eliminar productos
- No puede gestionar usuarios

### admin

- Puede ver el catalogo
- Puede crear, editar y eliminar productos
- Puede gestionar usuarios (CRUD + cambio de rol)

---

## Proteccion en Frontend

### ProtectedRoute

```jsx
function ProtectedRoute({ children, user, roles }) {
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.rol)) return <Navigate to="/" />;
    return children;
}
```

### Uso

```jsx
<Route path="/admin/products" element={
    <ProtectedRoute user={user} roles={['empleado', 'admin']}>
        <AdminProdPage />
    </ProtectedRoute>
} />

<Route path="/admin/users" element={
    <ProtectedRoute user={user} roles={['admin']}>
        <AdminUsersPage />
    </ProtectedRoute>
} />
```

---

## Auto-Logout

El interceptor de respuestas en `api.js` detecta errores 401/403:

```javascript
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

---

## Reset de Contrasena

### Flujo completo

```
1. Usuario ingresa email en "Forgot Password"
2. POST /api/auth/forgot-password { email }
3. Backend genera token: crypto.randomBytes(32).toString('hex')
4. Guarda token + expiracion (1 hora) en usuario
5. Retorna token (en produccion se enviaria por email)
6. Usuario ingresa token + nueva contrasena
7. POST /api/auth/reset-password { token, newPassword }
8. Backend valida token no expirado
9. Hashea nueva contrasena
10. Actualiza usuario, limpia token
```

### Seguridad

- Token aleatorio de 32 bytes (64 caracteres hex)
- Expira en 1 hora
- Se limpia despues de usar
- Si el email no existe, retorna mensaje generico (no revela si existe)

---

## Contraseñas

### Hash con bcrypt

```javascript
const SALT_ROUNDS = 10;

// Hashear
const hash = await bcrypt.hash(password, SALT_ROUNDS);

// Verificar
const isValid = await bcrypt.compare(password, user.password_hash);
```

### Seed del admin

El usuario admin se crea con un hash pre-generado:

```sql
INSERT INTO usuarios (nombre, usuario, email, password_hash, rol)
VALUES ('Administrador', 'admin', 'admin@tienda.cl',
        '$2b$10$e6d6kKYW.mdb0tScuEE6O.NG4RzlYQoMK3HhtcRqcoZjOSiIUZlzC',
        'admin');
```

Password: `123456`
