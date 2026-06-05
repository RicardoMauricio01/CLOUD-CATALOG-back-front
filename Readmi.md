# Activar rutas de usuarios en server.js

En tu `dev/backend/server.js`, agrega esta linea junto a tus otros imports de rutas:

```js
const userRoutes = require("./routes/userRoutes");
```

Luego agrega esta linea en la seccion donde ya activas `productRoutes`:

```js
app.use("/api/users", userRoutes);
```

Ejemplo:

```js
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
```

En esta copia local del proyecto, `server.js` esta en la raiz y las rutas nuevas quedaron dentro de `backend/`, por eso se usa:

```js
const userRoutes = require("./backend/routes/userRoutes");
app.use("/api/users", userRoutes);
```
