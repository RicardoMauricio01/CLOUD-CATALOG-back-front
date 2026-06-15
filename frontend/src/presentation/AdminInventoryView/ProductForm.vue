<template>
    <div class="modal-overlay" @click="$emit('close')">
        <div class="modal" @click.stop>
            <div class="modal-header">
                <h3 class="modal-title">{{ editingId ? 'Editar Producto' : 'Nuevo Producto' }}</h3>
                <button class="modal-close" @click="$emit('close')">&times;</button>
            </div>
            <form @submit.prevent="$emit('submit')">
                <div class="form-group">
                    <label>Nombre *</label>
                    <input type="text" :value="form.nombre" @input="update('nombre', $event.target.value)" required />
                </div>
                <div class="form-group">
                    <label>Descripcion</label>
                    <textarea :value="form.descripcion" @input="update('descripcion', $event.target.value)" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label>Precio *</label>
                    <input type="number" :value="form.precio" @input="update('precio', $event.target.value)" required min="0" step="0.01" />
                </div>
                <div class="form-group">
                    <label>Stock</label>
                    <input type="number" :value="form.stock" @input="update('stock', $event.target.value)" min="0" />
                </div>
                <div class="form-group">
                    <label>URL de imagen</label>
                    <input type="url" :value="form.imagen_url" @input="update('imagen_url', $event.target.value)" placeholder="https://ejemplo.com/imagen.jpg" />
                </div>
                <div class="form-group">
                    <label>Categoria</label>
                    <select :value="form.categoria_id" @input="update('categoria_id', $event.target.value)">
                        <option value="">Sin categoria</option>
                        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.nombre }}</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
                    <button type="submit" class="btn btn-primary">{{ editingId ? 'Guardar Cambios' : 'Crear Producto' }}</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    form: Object,
    editingId: [Number, null],
    categories: Array
});

const emit = defineEmits(['update:form', 'submit', 'close']);

function update(field, value) {
    emit('update:form', { ...props.form, [field]: value });
}
</script>
