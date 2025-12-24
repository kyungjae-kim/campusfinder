import { apiClient } from './client';
import type { LostItem, LostItemCreateRequest, LostItemUpdateRequest } from '@/types/lost.types';
import type { Page, Pageable } from '@/types/common.types';

export const lostApi = {
  // 분실 신고 등록
  create: async (data: LostItemCreateRequest): Promise<LostItem> => {
    const response = await apiClient.post('/api/lost', data);
    return response.data;
  },

  // 전체 목록 조회
  getAll: async (pageable: Pageable): Promise<Page<LostItem>> => {
    const response = await apiClient.get('/api/lost', {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  },

  // 내 분실 신고 목록
  getMy: async (): Promise<LostItem[]> => {
    const response = await apiClient.get('/api/lost/my');
    return response.data;
  },

  // 상세 조회
  getById: async (id: number): Promise<LostItem> => {
    const response = await apiClient.get(`/api/lost/${id}`);
    return response.data;
  },

  // 수정
  update: async (id: number, data: LostItemUpdateRequest): Promise<LostItem> => {
    const response = await apiClient.put(`/api/lost/${id}`, data);
    return response.data;
  },

  // 삭제
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/lost/${id}`);
  },
};
