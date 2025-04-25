<template>
    <v-card flat class="d-flex align-center mb-2">
        <v-avatar size="40">
        <img :src="author.avatar" alt="Avatar" />
        </v-avatar>
        <div class="ml-3">
        <div class="font-weight-medium">{{ author.name }}</div>
        <div class="text-grey text-caption d-flex align-center">
            <v-icon size="16" class="mr-1">mdi-map-marker</v-icon>
        </div>
        </div>
    </v-card>
</template>

<script setup>
    defineProps({
        author: {
            type: Object,
            required: true,
        },
    })
</script>

<style scoped>

</style>