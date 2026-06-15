import api from './http.js';

const userService = {
    getAll() { return api.get('/users').then(r => r.data); },
    getById(id) { return api.get(`/users/${id}`).then(r => r.data); },
    updateRole(id, rol) { return api.put(`/users/${id}/role`, { rol }).then(r => r.data); },
    delete(id) { return api.delete(`/users/${id}`).then(r => r.data); },
    getStats() { return api.get('/users/stats').then(r => r.data); }
};

export default userService;
