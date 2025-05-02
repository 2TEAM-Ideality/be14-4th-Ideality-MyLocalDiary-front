<template>
    <div
        ref="markerEl"
        class="custom-marker"
        @click="handleClick"
        @mouseover="showTooltip = true"
        @mouseleave="showTooltip = false"
    >

            <div v-if="showTooltip" class="spark-container">
                <div
                    v-for="(spark, idx) in sparks"
                    :key="idx"
                    class="spark"
                    :style="{
                        transform: `rotate(${spark.angle}deg) translate(${spark.radius}px)`
                    }"
                />
            </div>


        <img :src="imageSrc" alt="marker image" />


            <div v-if="showTooltip" class="tooltip">{{ name }}</div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['click'])
const showTooltip = ref(false)

const props = defineProps({
    image: { type: String, default: '' },
    post_id: { type: Number, default: 0 },
    name: { type: String, default: '' }
})

const imageSrc = computed(() =>
    props.image && props.image.trim() !== ''
        ? props.image
        : 'https://img.freepik.com/premium-vector/cute-cat-vector-illustration_961307-8342.jpg'
)

const markerEl = ref(null)
defineExpose({ markerEl })

</script>

<style scoped>
.custom-marker {
    position: relative;
    width: 70px;
    height: 70px;
    border: 3px solid #ffffff;
    border-radius: 50%;
    overflow: visible;
    background-color: white;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
}

.custom-marker img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    z-index: 2;
}


.tooltip {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Segoe UI', 'Noto Sans KR', sans-serif;
    color: rgb(26, 26, 26);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
    border: 1px solid rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    white-space: nowrap;
    z-index: 999;
    opacity: 1;
    transition: opacity 0.5s ease;
}


.tooltip::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background: inherit;
    border-left: 1px solid rgba(255, 255, 255, 0.25);
    border-bottom: 1px solid rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

</style>