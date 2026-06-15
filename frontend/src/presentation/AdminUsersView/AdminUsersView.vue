<template>
    <div class="container">
        <div class="section-header">
            <h2 class="section-title">Gestion de Usuarios</h2>
            <button class="btn btn-primary" @click="showModal = true">+ Nuevo Usuario</button>
        </div>

        <div class="stats-grid">
            <div class="stats-card">
                <h3>{{ getRoleStats('admin') }}</h3>
                <p>Administradores</p>
            </div>
            <div class="stats-card">
                <h3>{{ getRoleStats('empleado') }}</h3>
                <p>Empleados</p>
            </div>
            <div class="stats-card">
                <h3>{{ getRoleStats('cliente') }}</h3>
                <p>Clientes</p>
            </div>
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <p v-if="loading">Cargando usuarios...</p>

        <div v-else-if="users.length === 0" class="empty-state">
            <h3>No hay usuarios registrados</h3>
        </div>

        <div v-else class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Registro</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td>{{ user.id }}</td>
                        <td>{{ user.nombre }}</td>
                        <td>{{ user.usuario }}</td>
                        <td>{{ user.email }}</td>
                        <td>
                            <select v-model="user.rol" @change="handleRoleChange(user.id, user.rol)">
                                <option value="cliente">Cliente</option>
                                <option value="empleado">Empleado</option>
                                <option value="admin">Admin</option>
                            </select>
                        </td>
                        <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
                        <td>
                            <button class="btn btn-danger btn-sm" @click="handleDelete(user.id)">Eliminar</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <UserModal v-if="showModal" @close="showModal = false" @created="loadUsers" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import userService from '../../services/userService.js';
import UserModal from './UserModal.vue';
import './admin-users.css';

const users = ref([]);
const stats = ref([]);
const error = ref('');
const loading = ref(true);
const showModal = ref(false);

function getRoleStats(rol) {
    const found = stats.value.find(s => s.rol === rol);
    return found ? parseInt(found.total) : 0;
}

async function loadUsers() {
    try {
        const [usersData, statsData] = await Promise.all([
            userService.getAll(),
            userService.getStats()
        ]);
        users.value = usersData;
        stats.value = statsData;
    } catch (err) {
        error.value = 'Error cargando usuarios';
    } finally {
        loading.value = false;
    }
}

async function handleRoleChange(userId, newRole) {
    try {
        await userService.updateRole(userId, newRole);
    } catch (err) {
        error.value = err.response?.data?.error || err.message;
    }
}

async function handleDelete(userId) {
    if (!window.confirm('Estas seguro de eliminar este usuario?')) return;
    try {
        await userService.delete(userId);
        users.value = users.value.filter(u => u.id !== userId);
    } catch (err) {
        error.value = err.response?.data?.error || err.message;
    }
}

onMounted(loadUsers);
</script>
