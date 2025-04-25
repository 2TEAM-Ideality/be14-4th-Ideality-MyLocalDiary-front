<template>
    <LoadingModal :today="now" />
</template>

<script setup>
import LoadingModal from './LoadingModal.vue';

const now = new Date()
</script>
