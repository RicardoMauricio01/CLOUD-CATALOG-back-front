/**
 * Routes: Auth
 * Definición de endpoints de autenticación
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', AuthController.register);

// POST /api/auth/login - Iniciar sesión
router.post('/login', AuthController.login);

// POST /api/auth/forgot-password - Solicitar restablecimiento
router.post('/forgot-password', AuthController.forgotPassword);

// POST /api/auth/reset-password - Restablecer contraseña
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
