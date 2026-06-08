/**
 * Model: User
 * Queries SQL para gestión de usuarios (CRUD)
 */

const pool = require('../config/db');

const UserModel = {
    // Listar todos los usuarios (sin password_hash)
    async findAll() {
        const result = await pool.query(
            'SELECT id, nombre, usuario, email, rol, created_at, updated_at FROM usuarios ORDER BY id'
        );
        return result.rows;
    },

    // Buscar usuario por ID
    async findById(id) {
        const result = await pool.query(
            'SELECT id, nombre, usuario, email, rol, created_at, updated_at FROM usuarios WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    // Actualizar solo el rol de un usuario
    async updateRole(id, rol) {
        const result = await pool.query(
            `UPDATE usuarios
             SET rol = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id, nombre, usuario, email, rol, updated_at`,
            [rol, id]
        );
        return result.rows[0];
    },

    // Eliminar usuario
    async delete(id) {
        const result = await pool.query(
            'DELETE FROM usuarios WHERE id = $1 RETURNING id, nombre, usuario',
            [id]
        );
        return result.rows[0];
    },

    // Contar usuarios por rol
    async countByRole() {
        const result = await pool.query(
            'SELECT rol, COUNT(*) as total FROM usuarios GROUP BY rol'
        );
        return result.rows;
    }
};

module.exports = UserModel;
