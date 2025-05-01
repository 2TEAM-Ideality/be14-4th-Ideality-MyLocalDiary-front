// src/stores/notificationStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])

  const splitContent = (content) => {
    const match = content.match(/(.+?)님(.*)/)
    return match ? [match[1], `님${match[2]}`] : ['알 수 없음', content]
  }

  async function fetchNotifications(token) {
    try {
      const res = await axios.get('http://localhost:8080/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      notifications.value = res.data.map(noti => {
        const [nickname, action] = splitContent(noti.content)
        return {
          id: noti.id,
          nickname,
          action,
          content: noti.content,
          type: noti.type,
          accepted: noti.accepted,
          createdAt: noti.createdAt,
          read: noti.read,
          targetId: noti.targetId
        }
      })
    } catch (err) {
      console.error('❌ 알림 불러오기 실패:', err)
    }
  }

  function markAsRead(id) {
    const target = notifications.value.find(n => n.id === id)
    if (target) target.read = true
  }

  return {
    notifications,
    fetchNotifications,
    markAsRead
  }
})
