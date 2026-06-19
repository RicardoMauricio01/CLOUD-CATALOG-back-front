<template>
    <div class="auth-container">
        <div class="auth-card">
            <h1 class="auth-title">Cloud Catalog</h1>
            <p class="auth-subtitle">{{ subtitleText }}</p>

            <div v-if="error" class="alert alert-error">{{ error }}</div>
            <div v-if="success" class="alert alert-success">{{ success }}</div>

            <LoginForm
                :mode="mode"
                :form="form"
                :loading="loading"
                :submit-text="submitText"
                @update:form="form = $event"
                @submit="handleSubmit"
            />

            <div class="auth-toggle">
                <template v-if="mode === 'login'">
                    <p><a href="#" @click.prevent="mode = 'register'">Crear una cuenta</a></p>
                    <p><a href="#" @click.prevent="mode = 'forgot'">Olvidaste tu contrasena?</a></p>
                </template>
                <p v-else><a href="#" @click.prevent="mode = 'login'">Volver al login</a></p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../../services/authService.js';
import { useAppStore } from '../../state/appState.js';
import LoginForm from './LoginForm.vue';
import './login.css';

const store = useAppStore();
const router = useRouter();

const mode = ref('login');
const loading = ref(false);
const error = ref('');
const success = ref('');
const form = ref({
    nombre: '', usuario: '', email: '', password: '',
    confirmPassword: '', token: '', newPassword: '',
    color_favorito: ''
});

const subtitleText = computed(() => ({
    login: 'Inicia sesion en tu cuenta',
    register: 'Crea una nueva cuenta',
    forgot: 'Recupera tu contrasena',
    reset: 'Establece tu nueva contrasena'
}[mode.value] || ''));

const submitText = computed(() => ({
    login: 'Iniciar Sesion',
    register: 'Registrarse',
    forgot: 'Enviar Token',
    reset: 'Restablecer Contrasena'
}[mode.value] || ''));

async function handleSubmit() {
    loading.value = true;
    error.value = '';
    success.value = '';

    try {
        if (mode.value === 'login') {
            const result = await authService.login(form.value.usuario, form.value.password);
            store.login(result.token, result.user);
            router.push('/');
        } else if (mode.value === 'register') {
            if (form.value.password !== form.value.confirmPassword) {
                throw new Error('Las contrasenas no coinciden');
            }
            await authService.register({
                nombre: form.value.nombre,
                usuario: form.value.usuario,
                email: form.value.email,
                password: form.value.password,
                color_favorito: form.value.color_favorito
            });
            success.value = 'Usuario registrado exitosamente. Ahora puedes iniciar sesion.';
            mode.value = 'login';
        } else if (mode.value === 'forgot') {
            const result = await authService.forgotPassword(form.value.email, form.value.color_favorito);
            if (result.resetToken) {
                form.value.token = result.resetToken;
                mode.value = 'reset';
            }
        } else if (mode.value === 'reset') {
            if (form.value.newPassword !== form.value.confirmPassword) {
                throw new Error('Las contrasenas no coinciden');
            }
            await authService.resetPassword(form.value.token, form.value.newPassword);
            success.value = 'Contrasena actualizada. Ya puedes iniciar sesion.';
            mode.value = 'login';
        }
    } catch (err) {
        error.value = err.response?.data?.error || err.message;
    } finally {
        loading.value = false;
    }
}
</script>
