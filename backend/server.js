/**
 * Cloud Catalog - Punto de entrada del servidor
 * Express + Socket.io + Middlewares globales + Rutas API
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno según el entorno
dotenv.config({ path: path.join(__dirname, '.env') });

// Verificar variables de entorno obligatorias
const requiredEnvVars = ['PORT', 'DB_USER', 'DB_HOST', 'DB_NAME'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Error: Variable de entorno ${envVar} no definida`);
        process.exit(1);
    }
}

// Inicializar Express
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Puerto del servidor
const PORT = process.env.PORT || 3100;

// ============ MIDDLEWARES GLOBALES ============
app.use(cors());
app.use(express.json());

// Socket.io - hacer io accesible en controllers via req.app.locals.io
app.locals.io = io;

// Conexiones de Socket.io
io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
    });
});

// ============ RUTAS API ============
// Importar rutas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

// Montar rutas con prefijos
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// ============ RUTA DE PRUEBA ============
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Cloud Catalog API funcionando',
        timestamp: new Date().toISOString()
    });
});

// ============ ARCHIVOS ESTÁTICOS (FRONTEND) ============
// Servir el build de Vue desde frontend/dist
const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

// SPA Fallback - cualquier ruta no-API sirve index.html (Express 5 syntax)
app.get('/{*splat}', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
        res.status(404).json({ error: 'Endpoint no encontrado' });
    }
});

// ============ INICIAR SERVIDOR ============
server.listen(PORT, () => {
    console.log(`\n🚀 Cloud Catalog API corriendo en http://localhost:${PORT}`);
    console.log(`📡 Socket.io activo`);
    console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 PostgreSQL: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}\n`);
});

module.exports = { app, server, io };
