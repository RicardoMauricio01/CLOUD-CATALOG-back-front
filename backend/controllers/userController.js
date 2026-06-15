const UserService = require('../services/userService');

const UserController = {
    async getAll(req, res) {
        try {
            const users = await UserService.getAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getById(req, res) {
        try {
            const user = await UserService.getById(req.params.id);
            res.json(user);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    async updateRole(req, res) {
        try {
            const { rol } = req.body;

            if (!rol) {
                return res.status(400).json({ error: 'El campo rol es requerido' });
            }

            const user = await UserService.updateRole(req.params.id, rol);
            res.json({
                message: 'Rol actualizado exitosamente',
                user
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async delete(req, res) {
        try {
            const user = await UserService.delete(req.params.id);
            res.json({
                message: 'Usuario eliminado exitosamente',
                user
            });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    async getStats(req, res) {
        try {
            const stats = await UserService.getStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = UserController;
