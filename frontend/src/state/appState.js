import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAppStore = defineStore('app', () => {
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const token = ref(localStorage.getItem('token') || null);

    const isLoggedIn = computed(() => !!user.value);
    const isAdmin = computed(() => user.value?.rol === 'admin');
    const isEmpleado = computed(() => user.value?.rol === 'empleado');
    const canManageProducts = computed(() => isAdmin.value || isEmpleado.value);

    function login(newToken, userData) {
        token.value = newToken;
        user.value = userData;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
    }

    function logout() {
        token.value = null;
        user.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    return { user, token, isLoggedIn, isAdmin, isEmpleado, canManageProducts, login, logout };
});
