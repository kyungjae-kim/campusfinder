import {apiClient} from './client';
import type { User } from '@/types/auth.types';

export const userApi = {
  // 사용자 조회
  async getById(userId: number): Promise<User> {
    const response = await apiClient.get(`/api/users/${userId}`);
    return response.data;
  },
};
