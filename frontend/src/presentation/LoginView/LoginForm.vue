<template>
    <form @submit.prevent="$emit('submit')">
        <div v-if="mode === 'register'" class="form-group">
            <label>Nombre completo</label>
            <input type="text" :value="form.nombre" @input="update('nombre', $event.target.value)" required />
        </div>

        <div v-if="mode === 'login' || mode === 'register'" class="form-group">
            <label>Usuario</label>
            <input type="text" :value="form.usuario" @input="update('usuario', $event.target.value)" required />
        </div>

        <div v-if="mode === 'register' || mode === 'forgot'" class="form-group">
            <label>Email</label>
            <input type="email" :value="form.email" @input="update('email', $event.target.value)" required />
        </div>

        <div v-if="mode === 'login' || mode === 'register'" class="form-group">
            <label>Contrasena</label>
            <input type="password" :value="form.password" @input="update('password', $event.target.value)" required minlength="6" />
        </div>

        <div v-if="mode === 'register' || mode === 'reset'" class="form-group">
            <label>Confirmar contrasena</label>
            <input type="password" :value="form.confirmPassword" @input="update('confirmPassword', $event.target.value)" required />
        </div>

        <div v-if="mode === 'reset'" class="form-group">
            <label>Token de restablecimiento</label>
            <input type="text" :value="form.token" @input="update('token', $event.target.value)" required />
        </div>

        <div v-if="mode === 'reset'" class="form-group">
            <label>Nueva contrasena</label>
            <input type="password" :value="form.newPassword" @input="update('newPassword', $event.target.value)" required minlength="6" />
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%" :disabled="loading">
            {{ loading ? 'Procesando...' : submitText }}
        </button>
    </form>
</template>

<script setup>
const props = defineProps({
    mode: String,
    form: Object,
    loading: Boolean,
    submitText: String
});

const emit = defineEmits(['update:form', 'submit']);

function update(field, value) {
    emit('update:form', { ...props.form, [field]: value });
}
</script>
