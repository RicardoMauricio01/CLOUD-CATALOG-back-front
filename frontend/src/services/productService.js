import api from './http.js';

const productService = {
    getAll() { return api.get('/products').then(r => r.data); },
    getById(id) { return api.get(`/products/${id}`).then(r => r.data); },
    getByCategory(categoryId) { return api.get(`/products/category/${categoryId}`).then(r => r.data); },
    getCategories() { return api.get('/products/categories').then(r => r.data); },
    create(data) { return api.post('/products', data).then(r => r.data); },
    update(id, data) { return api.put(`/products/${id}`, data).then(r => r.data); },
    delete(id) { return api.delete(`/products/${id}`).then(r => r.data); }
};

export default productService;
