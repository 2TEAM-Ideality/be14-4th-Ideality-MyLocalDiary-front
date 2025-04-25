<template>
    <v-card flat class="d-flex align-center mb-2">
        <v-avatar size="40">
        <img :src="author.avatar" alt="Avatar" />
        </v-avatar>
        <div class="ml-3">
            <div class="font-weight-medium">{{ author.name }}</div>
            <div class="neighborhoods d-flex flex-wrap gap-2">
                <LocationChip
                    v-for="(place, i) in neighborhoods"
                    :key="i"
                    :place="place"
                />
                <v-chip size="small" class="muted" color="grey">+ 6</v-chip>
            </div>
        </div>
    </v-card>
</template>

<script setup>
    import LocationChip from '@/components/common/LocationChip.vue'
    defineProps({
        author: {
            type: Object,
            required: true,
        },
    })
    const neighborhoods = [
    { name: '신대방동 294', latitude: 37.4854, longitude: 126.9016 },
    { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 }
  ]
</script>

<style scoped>

</style>