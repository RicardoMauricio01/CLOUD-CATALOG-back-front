const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.get('/categories', ProductController.getCategories);
router.get('/category/:id', ProductController.getByCategory);
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

router.use(authenticateToken);
router.use(requireRole(['empleado', 'admin']));

router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);

module.exports = router;
