import { apiClient } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types/auth.types';

export const authApi = {
  // 로그인
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/auth/login', data);
    return response.data;
  },

  // 회원가입
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },
};
