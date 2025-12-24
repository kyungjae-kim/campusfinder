import { apiClient } from './client';
import type { Notification } from '@/types/notification.types';

export const notificationApi = {
  // 내 알림함 조회
  getMy: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/api/notifications/my');
    return response.data;
  },

  // 읽지 않은 알림 조회
  getUnread: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/api/notifications/my/unread');
    return response.data;
  },

  // 읽지 않은 알림 개수
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/api/notifications/my/unread/count');
    return response.data.count;
  },

  // 알림 읽음 처리
  markAsRead: async (id: number): Promise<Notification> => {
    const response = await apiClient.put(`/api/notifications/${id}/read`);
    return response.data;
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/api/notifications/read-all');
  },

  // 알림 삭제
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/notifications/${id}`);
  },
};
