<template>
    <LoadingModal :today="now" :message="message"/>
</template>

<script setup>
import LoadingModal from './LoadingModal.vue';

const now = new Date()
const message = "다이어리 작성 중"
</script>
