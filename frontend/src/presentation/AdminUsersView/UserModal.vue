<template>
    <div class="modal-overlay" @click="$emit('close')">
        <div class="modal" @click.stop>
            <div class="modal-header">
                <h3 class="modal-title">Nuevo Usuario</h3>
                <button class="modal-close" @click="$emit('close')">&times;</button>
            </div>
            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label>Nombre</label>
                    <input type="text" v-model="nombre" required />
                </div>
                <div class="form-group">
                    <label>Usuario</label>
                    <input type="text" v-model="usuario" required />
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" v-model="email" required />
                </div>
                <div class="form-group">
                    <label>Contrasena</label>
                    <input type="password" v-model="password" required minlength="6" />
                </div>
                <div class="form-group">
                    <label>Rol</label>
                    <select v-model="rol">
                        <option value="cliente">Cliente</option>
                        <option value="empleado">Empleado</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div v-if="error" class="alert alert-error">{{ error }}</div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
                    <button type="submit" class="btn btn-primary" :disabled="loading">
                        {{ loading ? 'Creando...' : 'Crear Usuario' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import authService from '../../services/authService.js';

const emit = defineEmits(['close', 'created']);

const nombre = ref('');
const usuario = ref('');
const email = ref('');
const password = ref('');
const rol = ref('cliente');
const loading = ref(false);
const error = ref('');

async function handleSubmit() {
    loading.value = true;
    error.value = '';
    try {
        await authService.register({
            nombre: nombre.value,
            usuario: usuario.value,
            email: email.value,
            password: password.value,
            rol: rol.value
        });
        emit('created');
        emit('close');
    } catch (err) {
        error.value = err.response?.data?.error || err.message;
    } finally {
        loading.value = false;
    }
}
</script>
