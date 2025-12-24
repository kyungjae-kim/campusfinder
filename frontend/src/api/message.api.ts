import { apiClient } from './client';
import type { Message, MessageSendRequest } from '@/types/message.types';

export const messageApi = {
  // 메시지 전송
  send: async (data: MessageSendRequest): Promise<Message> => {
    const response = await apiClient.post('/api/messages', data);
    return response.data;
  },

  // 인계 건의 채팅 내역 조회
  getByHandover: async (handoverId: number): Promise<Message[]> => {
    const response = await apiClient.get(`/api/messages/handover/${handoverId}`);
    return response.data;
  },

  // 메시지 읽음 처리
  markAsRead: async (messageId: number): Promise<Message> => {
    const response = await apiClient.put(`/api/messages/${messageId}/read`);
    return response.data;
  },

  // 인계 건의 모든 메시지 읽음 처리
  markAllAsRead: async (handoverId: number): Promise<void> => {
    await apiClient.put(`/api/messages/handover/${handoverId}/read-all`);
  },

  // 읽지 않은 메시지 개수
  getUnreadCount: async (handoverId: number): Promise<number> => {
    const response = await apiClient.get(`/api/messages/handover/${handoverId}/unread/count`);
    return response.data.count;
  },
};
