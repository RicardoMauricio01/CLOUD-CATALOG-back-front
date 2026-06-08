/**
 * Service: Product
 * Lógica de negocio para gestión de productos
 */

const ProductModel = require('../models/product.model');

const ProductService = {
    // Listar todos los productos
    async getAll() {
        return await ProductModel.findAll();
    },

    // Obtener productos por categoría
    async getByCategory(categoriaId) {
        return await ProductModel.findByCategory(categoriaId);
    },

    // Obtener producto por ID
    async getById(id) {
        const product = await ProductModel.findById(id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return product;
    },

    // Crear nuevo producto
    async create(data) {
        // Validaciones de negocio
        if (!data.nombre || data.nombre.trim() === '') {
            throw new Error('El nombre del producto es requerido');
        }

        if (!data.precio || data.precio <= 0) {
            throw new Error('El precio debe ser mayor a 0');
        }

        if (data.stock !== undefined && data.stock < 0) {
            throw new Error('El stock no puede ser negativo');
        }

        return await ProductModel.create({
            nombre: data.nombre.trim(),
            descripcion: data.descripcion ? data.descripcion.trim() : null,
            precio: parseFloat(data.precio),
            stock: parseInt(data.stock) || 0,
            imagen_url: data.imagen_url ? data.imagen_url.trim() : null,
            categoria_id: data.categoria_id || null
        });
    },

    // Actualizar producto
    async update(id, data) {
        // Verificar que el producto existe
        const existing = await ProductModel.findById(id);
        if (!existing) {
            throw new Error('Producto no encontrado');
        }

        // Validaciones de negocio
        if (!data.nombre || data.nombre.trim() === '') {
            throw new Error('El nombre del producto es requerido');
        }

        if (!data.precio || data.precio <= 0) {
            throw new Error('El precio debe ser mayor a 0');
        }

        return await ProductModel.update(id, {
            nombre: data.nombre.trim(),
            descripcion: data.descripcion ? data.descripcion.trim() : null,
            precio: parseFloat(data.precio),
            stock: parseInt(data.stock) || 0,
            imagen_url: data.imagen_url ? data.imagen_url.trim() : null,
            categoria_id: data.categoria_id || null
        });
    },

    // Eliminar producto
    async delete(id) {
        const product = await ProductModel.delete(id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return product;
    },

    // Obtener todas las categorías
    async getCategories() {
        return await ProductModel.findCategories();
    }
};

module.exports = ProductService;
