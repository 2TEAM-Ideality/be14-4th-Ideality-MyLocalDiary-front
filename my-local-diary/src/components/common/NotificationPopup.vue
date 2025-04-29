<template>
    <div v-if="isOpen" class="notification-popup">
      <header class="popup-header">
        <h2>알림</h2>
        <button class="close-btn" @click="closePopup">✖</button>
      </header>
  
      <section class="popup-body">
        <!-- 오늘 알림 -->
        <div v-if="groupedNotifications.today.length">
          <h3 class="section-title">오늘</h3>
          <ul>
            <li 
              v-for="n in groupedNotifications.today" 
              :key="n.id" 
              :class="['notification-item', { unread: !n.isRead }]"
              @click="handleNotificationClick(n.id, n.targetId)"
            >
              <strong>{{ n.nickname }}</strong> {{ n.action }}
            </li>
          </ul>
        </div>
  
        <!-- 이번 주 알림 -->
        <div v-if="groupedNotifications.thisWeek.length">
          <h3 class="section-title">이번 주</h3>
          <ul>
            <li 
              v-for="n in groupedNotifications.thisWeek" 
              :key="n.id" 
              :class="['notification-item', { unread: !n.isRead }]"
              @click="handleNotificationClick(n.id, n.targetId)"
            >
              <strong>{{ n.nickname }}</strong> {{ n.action }}
            </li>
          </ul>
        </div>
  
        <!-- 이전 알림 -->
        <div v-if="groupedNotifications.earlier.length">
          <h3 class="section-title">이전</h3>
          <ul>
            <li 
              v-for="n in groupedNotifications.earlier" 
              :key="n.id" 
              :class="['notification-item', { unread: !n.isRead }]"
              @click="handleNotificationClick(n.id, n.targetId)"
            >
              <strong>{{ n.nickname }}</strong> {{ n.action }}
            </li>
          </ul>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import dayjs from 'dayjs'
  import axios from 'axios'
  
  const props = defineProps({
    isOpen: Boolean,
    notifications: Array
  })
  
  const emit = defineEmits(['close'])
  const router = useRouter()
  
  const closePopup = () => {
    emit('close')
  }
  
  const handleNotificationClick = async (id, targetId) => {
  const noti = props.notifications.find(n => n.id === id);
  if (noti) {
    noti.isRead = true;
    
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`http://localhost:8080/api/notifications/${id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }

    router.push(`/profile/${targetId}`);
    emit('close');
  }
}

  
  // 🔥 날짜별 알림 그룹핑
  const groupedNotifications = computed(() => {
    const today = dayjs();
    const startOfWeek = today.startOf('week');
  
    const groups = {
      today: [],
      thisWeek: [],
      earlier: []
    };
  
    for (const noti of props.notifications) {
      const notiDate = dayjs(noti.createdAt);
  
      if (notiDate.isSame(today, 'day')) {
        groups.today.push(noti);
      } else if (notiDate.isAfter(startOfWeek)) {
        groups.thisWeek.push(noti);
      } else {
        groups.earlier.push(noti);
      }
    }
  
    return groups;
  })
  </script>
  
  <style scoped>
  .notification-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 400px;
    height: 100%;
    background-color: white;
    z-index: 1200;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #eee;
  }
  
  .popup-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: #fafafa;
  }
  
  .section-title {
    font-size: 18px;
    font-weight: bold;
    margin: 20px 0 10px;
  }
  
  .notification-item {
    background: white;
    padding: 15px 20px;
    margin-bottom: 15px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    font-size: 15px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: background-color 0.2s;
    cursor: pointer;
  }
  
  .notification-item:hover {
    background-color: #f0f0f0;
  }
  
  .unread {
    font-weight: bold;
  }
    
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
  }
  </style>
  