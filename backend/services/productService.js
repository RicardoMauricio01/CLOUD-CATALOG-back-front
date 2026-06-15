const ProductDao = require('../dao/productDao');
const { toProductResponse, toProductsResponse } = require('../dtos/productDto');

function sanitizeProductData(data) {
    return {
        nombre: data.nombre.trim(),
        descripcion: data.descripcion ? data.descripcion.trim() : null,
        precio: parseFloat(data.precio),
        stock: parseInt(data.stock) || 0,
        imagen_url: data.imagen_url ? data.imagen_url.trim() : null,
        categoria_id: data.categoria_id || null
    };
}

function validateProductData(data) {
    if (!data.nombre || data.nombre.trim() === '') {
        throw new Error('El nombre del producto es requerido');
    }
    if (!data.precio || data.precio <= 0) {
        throw new Error('El precio debe ser mayor a 0');
    }
    if (data.stock !== undefined && data.stock < 0) {
        throw new Error('El stock no puede ser negativo');
    }
}

const ProductService = {
    async getAll() {
        const products = await ProductDao.findAll();
        return toProductsResponse(products);
    },

    async getByCategory(categoriaId) {
        const products = await ProductDao.findByCategory(categoriaId);
        return toProductsResponse(products);
    },

    async getById(id) {
        const product = await ProductDao.findById(id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return toProductResponse(product);
    },

    async create(data) {
        validateProductData(data);
        const product = await ProductDao.create(sanitizeProductData(data));
        return toProductResponse(product);
    },

    async update(id, data) {
        const existing = await ProductDao.findById(id);
        if (!existing) {
            throw new Error('Producto no encontrado');
        }
        validateProductData(data);
        const product = await ProductDao.update(id, sanitizeProductData(data));
        return toProductResponse(product);
    },

    async delete(id) {
        const product = await ProductDao.delete(id);
        if (!product) {
            throw new Error('Producto no encontrado');
        }
        return product;
    },

    async getCategories() {
        return await ProductDao.findCategories();
    }
};

module.exports = ProductService;
