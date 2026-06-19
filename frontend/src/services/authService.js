import api from './http.js';

const authService = {
    login(usuario, password) {
        return api.post('/auth/login', { usuario, password }).then(r => r.data);
    },
    register(data) {
        return api.post('/auth/register', data).then(r => r.data);
    },
    forgotPassword(email, color_favorito) {
        return api.post('/auth/forgot-password', { email, color_favorito }).then(r => r.data);
    },
    resetPassword(token, newPassword) {
        return api.post('/auth/reset-password', { token, newPassword }).then(r => r.data);
    }
};

export default authService;
