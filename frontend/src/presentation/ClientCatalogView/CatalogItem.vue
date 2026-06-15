<template>
    <div class="product-card">
        <img
            v-if="product.imagen_url"
            :src="product.imagen_url"
            :alt="product.nombre"
            class="product-image"
            @error="(e) => e.target.style.display = 'none'"
        />
        <div v-else class="product-image" style="display: flex; align-items: center; justify-content: center; background-color: #f0f0f0; color: #999">
            Sin imagen
        </div>
        <div class="product-info">
            <h3 class="product-name">{{ product.nombre }}</h3>
            <p v-if="product.descripcion" style="font-size: 0.9rem; color: #666; margin-bottom: 8px">
                {{ product.descripcion }}
            </p>
            <p class="product-price">{{ formatPrice(product.precio) }}</p>
            <span v-if="product.categoria" class="product-category">{{ product.categoria }}</span>
            <p style="font-size: 0.85rem; color: #999; margin-top: 8px">Stock: {{ product.stock }}</p>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    product: { type: Object, required: true }
});

function formatPrice(price) {
    return '$ ' + new Intl.NumberFormat('es-CL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}
</script>
