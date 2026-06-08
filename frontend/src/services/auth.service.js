/**
 * Service: Auth (Frontend)
 * Funciones para autenticación en la API
 */

import api from './api';

const authService = {
    async login(usuario, password) {
        const response = await api.post('/auth/login', { usuario, password });
        return response.data;
    },

    async register(data) {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    async forgotPassword(email) {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    async resetPassword(token, newPassword) {
        const response = await api.post('/auth/reset-password', { token, newPassword });
        return response.data;
    }
};

export default authService;
