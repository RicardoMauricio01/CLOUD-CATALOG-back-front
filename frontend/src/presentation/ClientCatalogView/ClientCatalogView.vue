<template>
    <div>
        <section class="hero-carousel">
            <div
                v-for="(slide, index) in heroSlides"
                :key="index"
                class="hero-slide"
                :class="{ active: currentSlide === index }"
                :style="{ background: slide.gradient }"
            >
                <div class="hero-content">
                    <h1 class="hero-title">{{ slide.title }}</h1>
                    <p class="hero-subtitle">{{ slide.subtitle }}</p>
                    <a href="#productos" class="hero-cta" @click.prevent="scrollToProducts">{{ slide.cta }}</a>
                </div>
            </div>
            <button class="hero-arrow hero-arrow-left" @click="prevSlide">&#10094;</button>
            <button class="hero-arrow hero-arrow-right" @click="nextSlide">&#10095;</button>
            <div class="hero-dots">
                <button
                    v-for="(_, index) in heroSlides"
                    :key="index"
                    class="hero-dot"
                    :class="{ active: currentSlide === index }"
                    @click="currentSlide = index"
                />
            </div>
        </section>

        <div class="container" id="productos">
            <div v-if="store.isLoggedIn" class="welcome-banner">
                <h2>Bienvenido, {{ store.user.nombre }}</h2>
                <p v-if="store.isAdmin">
                    Tienes acceso completo al sistema. Gestiona productos y usuarios desde el panel de administracion.
                </p>
                <p v-else-if="store.isEmpleado">
                    Puedes gestionar los productos desde el panel de administracion.
                </p>
                <p v-else>Explora nuestro catalogo y encuentra lo que necesitas.</p>
                <template v-if="store.canManageProducts">
                    <router-link to="/admin/products" class="btn btn-primary" style="margin-top: 10px; display: inline-block">
                        Ir al Panel de Productos
                    </router-link>
                </template>
                <template v-if="store.isAdmin">
                    <router-link to="/admin/users" class="btn btn-secondary" style="margin-top: 10px; margin-left: 10px; display: inline-block">
                        Gestionar Usuarios
                    </router-link>
                </template>
            </div>
            <div v-else class="welcome-banner welcome-banner-guest">
                <h2>Catalogo de Productos</h2>
                <p>Inicia sesion para acceder a funciones adicionales de gestion.</p>
                <router-link to="/login" class="btn btn-primary" style="margin-top: 10px; display: inline-block">
                    Iniciar Sesion
                </router-link>
            </div>

            <div class="categories-filter">
                <button class="category-btn" :class="{ active: selectedCategory === null }" @click="selectedCategory = null">
                    Todos
                </button>
                <button
                    v-for="cat in categories"
                    :key="cat.id"
                    class="category-btn"
                    :class="{ active: selectedCategory === cat.id }"
                    @click="selectedCategory = cat.id"
                >{{ cat.nombre }}</button>
            </div>

            <div v-if="catalogError" class="alert alert-error">{{ catalogError }}</div>

            <div v-else-if="products.length === 0" class="empty-state">
                <h3>No hay productos disponibles</h3>
                <p>Selecciona otra categoria o vuelve mas tarde.</p>
            </div>
            <div v-else class="product-grid">
                <CatalogItem v-for="product in products" :key="product.id" :product="product" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import productService from '../../services/productService.js';
import { useAppStore } from '../../state/appState.js';
import CatalogItem from './CatalogItem.vue';
import './catalog.css';

const store = useAppStore();

const heroSlides = [
    {
        title: 'Bienvenido a Cloud Catalog',
        subtitle: 'Tu tienda de abarrotes online con los mejores precios',
        cta: 'Ver Productos',
        gradient: 'linear-gradient(135deg, #6bc76b 0%, #90ee90 100%)'
    },
    {
        title: 'Productos Frescos y de Calidad',
        subtitle: 'Despensa, lacteos, panaderia y mucho mas',
        cta: 'Explorar',
        gradient: 'linear-gradient(135deg, #4ecdc4 0%, #6bc76b 100%)'
    },
    {
        title: 'Ofertas Especiales',
        subtitle: 'Los mejores precios del mercado en un solo lugar',
        cta: 'Comprar Ahora',
        gradient: 'linear-gradient(135deg, #6bc76b 0%, #45b7d1 100%)'
    }
];

const currentSlide = ref(0);
const products = ref([]);
const categories = ref([]);
const selectedCategory = ref(null);
const catalogError = ref('');
let slideTimer = null;

function nextSlide() {
    currentSlide.value = (currentSlide.value + 1) % heroSlides.length;
}

function prevSlide() {
    currentSlide.value = (currentSlide.value - 1 + heroSlides.length) % heroSlides.length;
}

function scrollToProducts() {
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
}

watch(selectedCategory, async () => {
    catalogError.value = '';
    try {
        products.value = selectedCategory.value
            ? await productService.getByCategory(selectedCategory.value)
            : await productService.getAll();
    } catch (err) {
        catalogError.value = 'Error al cargar productos. Intenta de nuevo.';
    }
});

onMounted(async () => {
    try {
        categories.value = await productService.getCategories();
        products.value = await productService.getAll();
    } catch (err) {
        catalogError.value = 'Error al cargar los datos del catalogo.';
    }
    slideTimer = setInterval(nextSlide, 5000);
});

onUnmounted(() => {
    if (slideTimer) clearInterval(slideTimer);
});
</script>
