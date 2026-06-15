const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middlewares/authMiddleware');

router.use(authenticateToken);
router.use(requireRole(['admin']));

router.get('/', UserController.getAll);
router.get('/stats', UserController.getStats);
router.get('/:id', UserController.getById);
router.put('/:id/role', UserController.updateRole);
router.delete('/:id', UserController.delete);

module.exports = router;
