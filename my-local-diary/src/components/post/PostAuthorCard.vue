<template>
    <v-card flat class="d-flex align-center mb-2">
        <v-avatar size="40">
        <img :src="author.avatar" alt="Avatar" />
        </v-avatar>
        <div class="ml-3">
            <div class="font-weight-medium">{{ author.name }}</div>
            <!-- <div class="neighborhoods d-flex flex-wrap gap-2">
                <LocationChip
                    v-for="(place, i) in displayedNeighborhoods"
                    :key="i"
                    :place="place"
                />
                <v-chip v-if="extraCount !== 0" size="small" class="muted" color="grey">+ {{ extraCount }}</v-chip>
            </div> -->
        </div>
    </v-card>
</template>

<script setup>
    import LocationChip from '@/components/common/LocationChip.vue'
    import { computed } from 'vue';
    defineProps({
        author: {
            type: Object,
            required: true,
        },
    })
    const neighborhoods = [
    { name: '신대방동 294', latitude: 37.4854, longitude: 126.9016 },
    { name: '보라매로 73', latitude: 37.4923, longitude: 126.9248 },
    { name: 'text', latitude: 32.4923, longitude: 120.9248 }
  ]

    // 2개까지만 잘라서 보여줄 리스트
    const displayedNeighborhoods = computed(() => neighborhoods.slice(0, 2))

    // 남은 개수
    const extraCount = computed(() => neighborhoods.length - 2)
</script>

<style scoped>

</style>