const pool = require('../config/db');

const UserDao = {
    async findByUsername(usuario) {
        const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
        return result.rows[0];
    },

    async findByEmail(email) {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        return result.rows[0];
    },

    async findById(id) {
        const result = await pool.query(
            'SELECT id, nombre, usuario, email, rol, created_at, updated_at FROM usuarios WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    async findAll() {
        const result = await pool.query(
            'SELECT id, nombre, usuario, email, rol, created_at, updated_at FROM usuarios ORDER BY id'
        );
        return result.rows;
    },

    async create({ nombre, usuario, email, password_hash, rol = 'cliente' }) {
        const result = await pool.query(
            `INSERT INTO usuarios (nombre, usuario, email, password_hash, rol)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, nombre, usuario, email, rol, created_at`,
            [nombre, usuario, email, password_hash, rol]
        );
        return result.rows[0];
    },

    async updateRole(id, rol) {
        const result = await pool.query(
            `UPDATE usuarios SET rol = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id, nombre, usuario, email, rol, updated_at`,
            [rol, id]
        );
        return result.rows[0];
    },

    async delete(id) {
        const result = await pool.query(
            'DELETE FROM usuarios WHERE id = $1 RETURNING id, nombre, usuario',
            [id]
        );
        return result.rows[0];
    },

    async countByRole() {
        const result = await pool.query('SELECT rol, COUNT(*) as total FROM usuarios GROUP BY rol');
        return result.rows;
    },

    async setResetToken(email, token, expiry) {
        const result = await pool.query(
            `UPDATE usuarios SET reset_token = $1, reset_token_expiry = $2, updated_at = CURRENT_TIMESTAMP
             WHERE email = $3
             RETURNING id, email`,
            [token, expiry, email]
        );
        return result.rows[0];
    },

    async findByResetToken(token) {
        const result = await pool.query(
            'SELECT * FROM usuarios WHERE reset_token = $1 AND reset_token_expiry > NOW()',
            [token]
        );
        return result.rows[0];
    },

    async updatePassword(id, password_hash) {
        const result = await pool.query(
            `UPDATE usuarios SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id, email`,
            [password_hash, id]
        );
        return result.rows[0];
    }
};

module.exports = UserDao;
