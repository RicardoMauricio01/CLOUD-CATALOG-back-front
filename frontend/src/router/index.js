import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../presentation/LoginView/LoginView.vue';
import ClientCatalogView from '../presentation/ClientCatalogView/ClientCatalogView.vue';
import AdminInventoryView from '../presentation/AdminInventoryView/AdminInventoryView.vue';
import AdminUsersView from '../presentation/AdminUsersView/AdminUsersView.vue';
import { useAppStore } from '../state/appState.js';

const routes = [
    { path: '/', name: 'Catalog', component: ClientCatalogView },
    { path: '/login', name: 'Login', component: LoginView },
    {
        path: '/admin/products',
        name: 'AdminProducts',
        component: AdminInventoryView,
        meta: { requiresAuth: true, allowedRoles: ['empleado', 'admin'] }
    },
    {
        path: '/admin/users',
        name: 'AdminUsers',
        component: AdminUsersView,
        meta: { requiresAuth: true, allowedRoles: ['admin'] }
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const store = useAppStore();

    if (to.meta.requiresAuth && !store.user) {
        return next('/login');
    }

    if (to.meta.allowedRoles && store.user && !to.meta.allowedRoles.includes(store.user.rol)) {
        return next('/');
    }

    next();
});

export default router;
