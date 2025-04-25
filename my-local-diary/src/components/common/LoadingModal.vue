<template>
    <div class="modal-overlay">
        <div class="modal-content">
            <p class="date">
                {{ formattedDate }}
            </p>
            <p class="text">다이어리 등록중</p>
            <l-bouncy size="60" speed="1.75" color="#FF9090" />
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import 'ldrs/bouncy'

// 📌 Date 객체로 props 받기
const props = defineProps({
    today: {
        type: Date,
        required: true
    }
})

// 📌 Date를 포맷해서 출력
const formattedDate = computed(() =>
    props.today.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    })
)
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.modal-content {
    background: white;
    padding: 50px 50px;
    border-radius: 16px;
    text-align: center;
    max-width: 300px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.date {
    font-weight: bold;
    font-size: 18px;
    margin-bottom: 8px;
    color: #FF9090;
}

.text {
    font-weight: 900;
    margin: 8px 0;
    font-size: 30px;
    color: #FF9090;
}
</style>
