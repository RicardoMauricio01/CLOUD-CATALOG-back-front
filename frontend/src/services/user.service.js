/**
 * Service: User (Frontend)
 * Funciones para gestión de usuarios en la API
 */

import api from './api';

const userService = {
    async getAll() {
        const response = await api.get('/users');
        return response.data;
    },

    async getById(id) {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    async updateRole(id, rol) {
        const response = await api.put(`/users/${id}/role`, { rol });
        return response.data;
    },

    async delete(id) {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    },

    async getStats() {
        const response = await api.get('/users/stats');
        return response.data;
    }
};

export default userService;
