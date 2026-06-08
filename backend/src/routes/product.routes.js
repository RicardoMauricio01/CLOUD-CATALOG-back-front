/**
 * Routes: Product
 * Definición de endpoints de gestión de productos
 * Lectura: cualquier usuario autenticado
 * Escritura: empleado y admin
 */

const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');
const { authenticateToken, requireRole } = require('../middlewares/auth.middleware');

// GET /api/products/categories - Listar categorías (público)
router.get('/categories', ProductController.getCategories);

// GET /api/products/category/:id - Productos por categoría (público)
router.get('/category/:id', ProductController.getByCategory);

// GET /api/products - Listar todos los productos (público)
router.get('/', ProductController.getAll);

// GET /api/products/:id - Obtener producto por ID (público)
router.get('/:id', ProductController.getById);

// Las siguientes rutas requieren autenticación y rol empleado o admin
router.use(authenticateToken);
router.use(requireRole(['empleado', 'admin']));

// POST /api/products - Crear producto
router.post('/', ProductController.create);

// PUT /api/products/:id - Actualizar producto
router.put('/:id', ProductController.update);

// DELETE /api/products/:id - Eliminar producto
router.delete('/:id', ProductController.delete);

module.exports = router;
