<template>
    <div class="container">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
            <h2 style="color: #6bc76b">Gestion de Productos</h2>
            <button class="btn btn-primary" @click="openModal(null)">+ Nuevo Producto</button>
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <p v-if="loading">Cargando productos...</p>

        <div v-else-if="products.length === 0" class="empty-state">
            <h3>No hay productos registrados</h3>
            <p>Crea tu primer producto usando el boton "+ Nuevo Producto".</p>
        </div>

        <div v-else class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Categoria</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="product in products" :key="product.id">
                        <td>{{ product.id }}</td>
                        <td>{{ product.nombre }}</td>
                        <td>{{ formatPrice(product.precio) }}</td>
                        <td>{{ product.stock }}</td>
                        <td>{{ product.categoria || 'Sin categoria' }}</td>
                        <td>
                            <button class="btn btn-secondary btn-sm" @click="openModal(product)">Editar</button>
                            <button class="btn btn-danger btn-sm" @click="handleDelete(product.id)">Eliminar</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <ProductForm
            v-if="showModal"
            :form="form"
            :editing-id="editingId"
            :categories="categories"
            @update:form="form = $event"
            @submit="handleSubmit"
            @close="showModal = false"
        />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import productService from '../../services/productService.js';
import ProductForm from './ProductForm.vue';
import './inventory.css';

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref('');
const showModal = ref(false);
const editingId = ref(null);
const form = ref({
    nombre: '', descripcion: '', precio: '', stock: '',
    imagen_url: '', categoria_id: ''
});

let socket = null;

function resetForm() {
    form.value = { nombre: '', descripcion: '', precio: '', stock: '', imagen_url: '', categoria_id: '' };
    editingId.value = null;
}

function formatPrice(price) {
    return '$ ' + new Intl.NumberFormat('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

function openModal(product) {
    error.value = '';
    if (product) {
        editingId.value = product.id;
        form.value = {
            nombre: product.nombre,
            descripcion: product.descripcion || '',
            precio: product.precio,
            stock: product.stock,
            imagen_url: product.imagen_url || '',
            categoria_id: product.categoria_id || ''
        };
    } else {
        resetForm();
    }
    showModal.value = true;
}

async function handleSubmit() {
    error.value = '';
    try {
        const data = {
            ...form.value,
            precio: parseFloat(form.value.precio),
            stock: parseInt(form.value.stock) || 0,
            categoria_id: form.value.categoria_id || null
        };
        if (editingId.value) {
            await productService.update(editingId.value, data);
        } else {
            await productService.create(data);
        }
        showModal.value = false;
        resetForm();
    } catch (err) {
        error.value = err.response?.data?.error || err.message;
    }
}

async function handleDelete(id) {
    if (!window.confirm('Estas seguro de eliminar este producto?')) return;
    try {
        await productService.delete(id);
    } catch (err) {
        error.value = err.response?.data?.error || err.message;
    }
}

onMounted(async () => {
    socket = io();
    socket.on('product:created', (product) => { products.value.push(product); });
    socket.on('product:updated', (product) => {
        const idx = products.value.findIndex(p => p.id === product.id);
        if (idx !== -1) products.value[idx] = product;
    });
    socket.on('product:deleted', ({ id }) => {
        products.value = products.value.filter(p => p.id !== id);
    });

    try {
        const [prods, cats] = await Promise.all([
            productService.getAll(),
            productService.getCategories()
        ]);
        products.value = prods;
        categories.value = cats;
    } catch (err) {
        error.value = 'Error cargando datos';
    } finally {
        loading.value = false;
    }
});

onUnmounted(() => {
    if (socket) socket.disconnect();
});
</script>
