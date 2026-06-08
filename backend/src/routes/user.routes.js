/**
 * Routes: User
 * Definición de endpoints de gestión de usuarios
 * Solo accesible por administradores
 */

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol admin
router.use(authenticateToken);
router.use(requireRole(['admin']));

// GET /api/users - Listar todos los usuarios
router.get('/', UserController.getAll);

// GET /api/users/stats - Estadísticas de usuarios
router.get('/stats', UserController.getStats);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', UserController.getById);

// PUT /api/users/:id/role - Actualizar rol de usuario
router.put('/:id/role', UserController.updateRole);

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', UserController.delete);

module.exports = router;
