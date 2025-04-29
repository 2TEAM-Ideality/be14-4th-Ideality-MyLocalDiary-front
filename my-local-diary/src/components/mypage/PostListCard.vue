<template>
    <div class="pt-2 pb-2">
        <img 
            :src="post.thumbnail"   
            width="50"
            height="50"
            border-radius
            style="display: inline-block; vertical-align: middle; margin-right: 5px; border-radius: 50%; border: 2px solid black"
            />
        <div style="display: inline-block; vertical-align: middle; width: calc(100% - 55px);">
            <div>
                <!-- 제목 -->
                {{ post.postTitle }}
            </div>
            <div class="d-flex" style="justify-content: space-between; align-items: center; width: 100%">
                <div class="d-flex gap-2">
                    <LocationChip
                        v-for="(place, i) in displayedNeighborhoods"
                        :key="i"
                        :place="place"
                    />
                    <v-chip v-if="extraCount !== 0" size="small" class="muted" color="grey">+ {{ extraCount }}</v-chip>
                </div>
                <div style="font-size: 12px">
                    {{ post.createdAt }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import LocationChip from '../common/LocationChip.vue'
    import { computed } from 'vue'
    const props = defineProps({
        post: {
            type: Object,
            required: true
        }
    })

  // 2개까지만 잘라서 보여줄 리스트
const displayedNeighborhoods = computed(() => props.post.neighborhoods.slice(0, 2))

// 남은 개수
const extraCount = computed(() => props.post.neighborhoods.length - 2)
</script>

<style scoped>
</style>