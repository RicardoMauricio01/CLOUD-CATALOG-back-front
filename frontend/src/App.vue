<template>
    <div class="app">
        <NavBar />
        <router-view />
    </div>
</template>

<script setup>
import NavBar from './presentation/widgets/NavBar.vue';
</script>
