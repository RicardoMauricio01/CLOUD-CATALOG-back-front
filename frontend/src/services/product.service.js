/**
 * Service: Product (Frontend)
 * Funciones para gestión de productos en la API
 */

import api from './api';

const productService = {
    async getAll() {
        const response = await api.get('/products');
        return response.data;
    },

    async getById(id) {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    async getByCategory(categoryId) {
        const response = await api.get(`/products/category/${categoryId}`);
        return response.data;
    },

    async getCategories() {
        const response = await api.get('/products/categories');
        return response.data;
    },

    async create(data) {
        const response = await api.post('/products', data);
        return response.data;
    },

    async update(id, data) {
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    }
};

export default productService;
