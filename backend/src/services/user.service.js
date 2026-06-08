/**
 * Service: User
 * Lógica de negocio para gestión de usuarios
 */

const UserModel = require('../models/user.model');

const UserService = {
    // Listar todos los usuarios
    async getAll() {
        return await UserModel.findAll();
    },

    // Obtener usuario por ID
    async getById(id) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return user;
    },

    // Actualizar rol de usuario
    async updateRole(id, rol) {
        // Validar que el rol sea válido
        const validRoles = ['cliente', 'empleado', 'admin'];
        if (!validRoles.includes(rol)) {
            throw new Error(`Rol inválido. Roles permitidos: ${validRoles.join(', ')}`);
        }

        const user = await UserModel.updateRole(id, rol);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return user;
    },

    // Eliminar usuario
    async delete(id) {
        const user = await UserModel.delete(id);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return user;
    },

    // Obtener estadísticas de usuarios
    async getStats() {
        return await UserModel.countByRole();
    }
};

module.exports = UserService;
