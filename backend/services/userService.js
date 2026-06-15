const UserDao = require('../dao/userDao');
const { toPublicUser, toPublicUsers } = require('../dtos/userDto');

const UserService = {
    async getAll() {
        const users = await UserDao.findAll();
        return toPublicUsers(users);
    },

    async getById(id) {
        const user = await UserDao.findById(id);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return toPublicUser(user);
    },

    async updateRole(id, rol) {
        const validRoles = ['cliente', 'empleado', 'admin'];
        if (!validRoles.includes(rol)) {
            throw new Error(`Rol invalido. Roles permitidos: ${validRoles.join(', ')}`);
        }

        const user = await UserDao.updateRole(id, rol);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return toPublicUser(user);
    },

    async delete(id) {
        const user = await UserDao.delete(id);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return user;
    },

    async getStats() {
        return await UserDao.countByRole();
    }
};

module.exports = UserService;
