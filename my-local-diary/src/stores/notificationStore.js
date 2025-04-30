import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: []
  }),
  actions: {
    addNotification(noti) {
      this.notifications.unshift(noti)
    },
    setNotifications(list) {
      this.notifications = list
    },
    markAsRead(id) {
      const noti = this.notifications.find(n => n.id === id)
      if (noti) noti.isRead = true
    }
  }
})
