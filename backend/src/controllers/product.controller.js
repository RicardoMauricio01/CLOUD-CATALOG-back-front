/**
 * Controller: Product
 * Orquestación HTTP para gestión de productos + Socket.io
 */

const ProductService = require('../services/product.service');

const ProductController = {
    // GET /api/products
    async getAll(req, res) {
        try {
            const products = await ProductService.getAll();
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/products/categories
    async getCategories(req, res) {
        try {
            const categories = await ProductService.getCategories();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/products/category/:id
    async getByCategory(req, res) {
        try {
            const products = await ProductService.getByCategory(req.params.id);
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/products/:id
    async getById(req, res) {
        try {
            const product = await ProductService.getById(req.params.id);
            res.json(product);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    // POST /api/products
    async create(req, res) {
        try {
            const product = await ProductService.create(req.body);

            // Emitir evento Socket.io para actualización en tiempo real
            req.app.locals.io.emit('product:created', product);

            res.status(201).json({
                message: 'Producto creado exitosamente',
                product
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // PUT /api/products/:id
    async update(req, res) {
        try {
            const product = await ProductService.update(req.params.id, req.body);

            // Emitir evento Socket.io para actualización en tiempo real
            req.app.locals.io.emit('product:updated', product);

            res.json({
                message: 'Producto actualizado exitosamente',
                product
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // DELETE /api/products/:id
    async delete(req, res) {
        try {
            const product = await ProductService.delete(req.params.id);

            // Emitir evento Socket.io para actualización en tiempo real
            req.app.locals.io.emit('product:deleted', { id: parseInt(req.params.id) });

            res.json({
                message: 'Producto eliminado exitosamente',
                product
            });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
};

module.exports = ProductController;
