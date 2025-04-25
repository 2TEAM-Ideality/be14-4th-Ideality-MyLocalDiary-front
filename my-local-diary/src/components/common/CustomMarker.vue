<template>
    <div
        ref="markerEl"
        class="custom-marker"
        @click="handleClick"
        @mouseover="showTooltip = true"
        @mouseleave="showTooltip = false"
    >
        <img :src="imageSrc" alt="marker image" />
        <div v-if="showTooltip" class="tooltip">{{ name }}</div>
    </div>
</template>

<script setup>
    import { ref, computed } from 'vue'

    const emit = defineEmits(['click'])
    const showTooltip = ref(false)

    const props = defineProps({
        image: {
            type: String,
            default: ''
        },
        post_id: {
            type: Number,
            default: 0
        },
        name: {
            type: String,
            default: ''
        }
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
</script>

<style scoped>
    .custom-marker {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        border: 3px solid #ffffff;
        overflow: hidden;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
        background-color: white;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .custom-marker img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .tooltip {
        position: absolute;
        top: -40px;
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
        animation: popUp 0.2s ease-out forwards;
        opacity: 0;
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

    @keyframes popUp {
        0% {
            transform: translateX(-50%) scale(0.8) translateY(0);
            opacity: 0;
        }
        100% {
            transform: translateX(-50%) scale(1) translateY(-6px);
            opacity: 1;
        }
    }
</style>
