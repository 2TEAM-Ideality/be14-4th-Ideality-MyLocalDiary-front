<template>
    <div ref="markerEl" class="custom-marker" @click="handleClick">
        <img :src="imageSrc" alt="marker image" />
    </div>
</template>

<script setup>
    import { ref, computed } from 'vue'
    const emit = defineEmits(['click']) 


    const props = defineProps({
        image: {
            type: String,
            default: ''
        },
        post_id:{
            type: Number,
            default: 0
        },
        name:{
            type: String,
            default:" "
        }
    })

    // 빈 문자열도 기본 이미지로 대체
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
</style>
