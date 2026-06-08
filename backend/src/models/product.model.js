/**
 * Model: Product
 * Queries SQL para gestión de productos (CRUD)
 */

const pool = require('../config/db');

const ProductModel = {
    // Listar todos los productos con nombre de categoría
    async findAll() {
        const result = await pool.query(
            `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock,
                    p.imagen_url, p.categoria_id, c.nombre as categoria,
                    p.created_at, p.updated_at
             FROM productos p
             LEFT JOIN categorias c ON p.categoria_id = c.id
             ORDER BY p.id`
        );
        return result.rows;
    },

    // Buscar productos por categoría
    async findByCategory(categoria_id) {
        const result = await pool.query(
            `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock,
                    p.imagen_url, p.categoria_id, c.nombre as categoria,
                    p.created_at, p.updated_at
             FROM productos p
             LEFT JOIN categorias c ON p.categoria_id = c.id
             WHERE p.categoria_id = $1
             ORDER BY p.nombre`,
            [categoria_id]
        );
        return result.rows;
    },

    // Buscar producto por ID
    async findById(id) {
        const result = await pool.query(
            `SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock,
                    p.imagen_url, p.categoria_id, c.nombre as categoria,
                    p.created_at, p.updated_at
             FROM productos p
             LEFT JOIN categorias c ON p.categoria_id = c.id
             WHERE p.id = $1`,
            [id]
        );
        return result.rows[0];
    },

    // Crear nuevo producto
    async create({ nombre, descripcion, precio, stock, imagen_url, categoria_id }) {
        const result = await pool.query(
            `INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, categoria_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [nombre, descripcion, precio, stock || 0, imagen_url, categoria_id]
        );
        return result.rows[0];
    },

    // Actualizar producto
    async update(id, { nombre, descripcion, precio, stock, imagen_url, categoria_id }) {
        const result = await pool.query(
            `UPDATE productos
             SET nombre = $1, descripcion = $2, precio = $3, stock = $4,
                 imagen_url = $5, categoria_id = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7
             RETURNING *`,
            [nombre, descripcion, precio, stock, imagen_url, categoria_id, id]
        );
        return result.rows[0];
    },

    // Eliminar producto
    async delete(id) {
        const result = await pool.query(
            'DELETE FROM productos WHERE id = $1 RETURNING id, nombre',
            [id]
        );
        return result.rows[0];
    },

    // Listar todas las categorías
    async findCategories() {
        const result = await pool.query(
            'SELECT * FROM categorias ORDER BY nombre'
        );
        return result.rows;
    }
};

module.exports = ProductModel;
