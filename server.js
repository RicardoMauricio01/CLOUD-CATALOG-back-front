const dotenv = require('dotenv');
const path = require('path');

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;

dotenv.config({ path: envFile });

console.log(`Usando configuración: ${envFile}`);

// Validación de variables de entorno requeridas
const requiredEnvVars = [
    'PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_HOST',
    'DB_NAME',
    'NODE_ENV'
];

requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
        console.error(`Falta la variable de entorno: ${envVar}`);
        process.exit(1);
    }
});

console.log('Variables de entorno cargadas correctamente');

const express = require('express');
const cors = require('cors');
const pool = require('./db');
const userRoutes = require('./backend/routes/userRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Rutas de la API
app.use('/api/users', userRoutes);

// Ruta inicial - redirige al panel de usuarios
app.get('/', (req, res) => {
    res.redirect('/usuarios.html');
});

// Ruta de prueba de base de datos
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: "Conexión exitosa", time: result.rows[0] });
    } catch (err) {
        console.error("Error en la DB:", err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('==========================================');
    console.log(` SERVIDOR ARRANCADO`);
    console.log(` Puerto: ${PORT}`);
    console.log(` Entorno: ${process.env.NODE_ENV}`);
    console.log(` Panel de usuarios: http://localhost:${PORT}`);
    console.log('==========================================');
});
