<template>
    <nav class="navbar">
        <router-link to="/" class="navbar-brand">Cloud Catalog</router-link>
        <ul class="navbar-nav">
            <li><router-link to="/">Home</router-link></li>
            <li><a href="#" @click.prevent="goToCatalog">Catalogo</a></li>
            <li v-if="store.canManageProducts">
                <router-link to="/admin/products">Productos</router-link>
            </li>
            <li v-if="store.isAdmin">
                <router-link to="/admin/users">Usuarios</router-link>
            </li>
            <li v-if="store.isLoggedIn">
                <span class="navbar-user">
                    {{ store.user.nombre }}
                    <span class="navbar-role">{{ store.user.rol }}</span>
                </span>
            </li>
            <li v-if="store.isLoggedIn">
                <button @click="handleLogout">Cerrar Sesion</button>
            </li>
            <li v-else>
                <router-link to="/login">Iniciar Sesion</router-link>
            </li>
        </ul>
    </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAppStore } from '../../state/appState.js';

const store = useAppStore();
const router = useRouter();

function handleLogout() {
    store.logout();
    router.push('/login');
}

function goToCatalog() {
    if (router.currentRoute.value.path === '/') {
        document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
    } else {
        router.push('/').then(() => {
            setTimeout(() => {
                document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });
    }
}
</script>
