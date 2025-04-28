<template>
    <v-card class="calendar-card">
        <!-- 우측 상단 떠있는 토글 버튼 -->
        <v-btn
            icon
            variant="elevated"
            class="floating-toggle"
            @click="toggleView"
            elevation="3"
            size="small"
            color="white"
        >
            <v-icon color="black">{{ showCalendar ? 'mdi-magnify' : 'mdi-calendar' }}</v-icon>
        </v-btn>

        <template v-if="showCalendar">
            <v-date-picker
                show-adjacent-months
                class="calendar"
                :allowed-dates="allowedDates"
                v-model="selectedDate"
                @update:model-value="handleDateClick"
            >
            </v-date-picker>
        </template>
        <template v-else>
            <div class="header">
                <span class="chart-title">시원님이 만드신거</span>
            </div>
            <div class="content-box">
                <!-- 게시글 등 들어갈 자리 -->
            </div>
        </template>
    </v-card>

    <div v-if="selectedPostId !== null" class="modal-overlay" @click="selectedPostId = null">
        <div class="modal-content d-flex flex-column" @click.stop     style="
            width: 1000px;
            height: 90%;
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            display: flex;
        ">
            <div class="d-flex justify-end">
                <button class="pr-3 pl-3" @click="selectedPostId = null">X</button>
            </div>
            <PostCard/>
        </div>
    </div>
</template>

<script setup>
import PostCard from '../post/PostCard.vue';
import { ref } from 'vue'
import axios from 'axios'

const selectedPostId=ref(null);
const showCalendar = ref(true)
const selectedDate = ref(null)

const allowedList = [
    '2025-04-01',
    '2025-04-05',
    '2025-04-10'
]

const allowedDates = (date) => {
    const formatted = new Date(date).toISOString().slice(0, 10)
    return allowedList.includes(formatted)
}

function toggleView() {
    showCalendar.value = !showCalendar.value
}

async function handleDateClick(date) {
    try {
        const formattedDate = new Date(date).toISOString().slice(0, 10)
        const response = await axios.get('http://localhost:3001/calendar', {
            params: { date: formattedDate }
        })
        selectedPostId.value = response.data.postId
        console.log('✅ selectedPostId 업데이트:', selectedPostId.value)
    }
    catch (error) {
        console.error('❌ 날짜 데이터 요청 실패:', error)
        selectedPostId.value=1;
    }
}
</script>

<style scoped>
.calendar-card {
    position: relative; 
    display: flex;
    flex-direction: column;
    padding: 24px;
    height: 100%;
}

.floating-toggle {
    position: absolute;
    top: 18px;
    right: 18px;
    z-index: 10;
    background-color: #f0f0f0;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.calendar {
    width: 100%;
    height: 100%;
}

.content-box {
    width: 100%;
    height: 100%;
    align-items: center;
    align-content: center;
}

:deep(.v-picker-title) {
    display: none !important;
}

:deep(.v-date-picker-header) {
    margin-top: 0 !important;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chart-title {
    font-size: 20px;
    font-weight: bold;
    color: #4C4C4C;
}

.modal-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
}

.modal-content {
    background-color: white;
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
</style>
