<template>
    <div
        ref="markerEl"
        class="custom-marker"
        @click="handleClick"
        @mouseover="showTooltip = true"
        @mouseleave="showTooltip = false"
    >
        <transition name="fade">
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
        </transition>

        <img :src="imageSrc" alt="marker image" />

        <transition name="fade">
            <div v-if="showTooltip" class="tooltip">{{ name }}</div>
        </transition>
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

function handleClick() {
    emit('click', props.post_id)
}

const sparks = ref([])
onMounted(() => {
    sparks.value = Array.from({ length: 180 }, (_, i) => ({
        angle: i * 2,
        radius: Math.random() * 10 + 40
    }))
})
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

.spark-container {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1px;
    height: 1px;
    transform: translate(-50%, -50%);
    animation: rotate 1.2s linear infinite;
    z-index: 1;
    pointer-events: none;
    opacity: 1;
    transition: opacity 0.5s ease;
}

.spark {
    position: absolute;
    width: 1px;
    height: 20px;
    background: linear-gradient(rgb(255, 106, 0), transparent);
    transform-origin: top left;
    animation: resizer 1s ease-in-out infinite;
}

.tooltip {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
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

@keyframes rotate {
    to {
        transform: translate(-50%, -50%) rotate(-360deg);
    }
}

@keyframes resizer {
    0%, 100% {
        height: 20px;
    }
    50% {
        height: 40px;
    }
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

.fade-enter-to, .fade-leave-from {
    opacity: 1;
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s ease;
}
</style>