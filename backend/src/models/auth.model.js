/**
 * Model: Auth
 * Queries SQL para autenticación y recuperación de contraseñas
 */

const pool = require('../config/db');

const AuthModel = {
    // Buscar usuario por nombre de usuario
    async findByUsername(usuario) {
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE usuario = $1',
            [usuario]
        );
        return result.rows[0];
    },

    // Buscar usuario por email
    async findByEmail(email) {
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE email = $1',
            [email]
        );
        return result.rows[0];
    },

    // Buscar usuario por ID
    async findById(id) {
        const result = await pool.query(
            'SELECT id, nombre, usuario, email, rol, created_at FROM usuarios WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    // Crear nuevo usuario
    async create({ nombre, usuario, email, password_hash, rol = 'cliente' }) {
        const result = await pool.query(
            `INSERT INTO usuarios (nombre, usuario, email, password_hash, rol)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, nombre, usuario, email, rol, created_at`,
            [nombre, usuario, email, password_hash, rol]
        );
        return result.rows[0];
    },

    // Guardar token de restablecimiento
    async setResetToken(email, token, expiry) {
        const result = await pool.query(
            `UPDATE usuarios
             SET reset_token = $1, reset_token_expiry = $2, updated_at = CURRENT_TIMESTAMP
             WHERE email = $3
             RETURNING id, email`,
            [token, expiry, email]
        );
        return result.rows[0];
    },

    // Buscar usuario por token de restablecimiento
    async findByResetToken(token) {
        const result = await pool.query(
            `SELECT * FROM usuarios
             WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
            [token]
        );
        return result.rows[0];
    },

    // Actualizar contraseña y limpiar token
    async updatePassword(id, password_hash) {
        const result = await pool.query(
            `UPDATE usuarios
             SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id, email`,
            [password_hash, id]
        );
        return result.rows[0];
    }
};

module.exports = AuthModel;
