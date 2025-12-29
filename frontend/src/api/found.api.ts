import { apiClient } from './client';
import type { FoundItem, FoundItemCreateRequest, FoundItemUpdateRequest } from '@/types/found.types';
import type { Page, Pageable } from '@/types/common.types';

export const foundApi = {
  // 습득물 등록
  create: async (data: FoundItemCreateRequest): Promise<FoundItem> => {
    const response = await apiClient.post('/api/found', data);
    return response.data;
  },

  // 전체 목록 조회
  getAll: async (pageable: Pageable): Promise<Page<FoundItem>> => {
    const response = await apiClient.get('/api/found', {
      params: {
        page: pageable.page,
        size: pageable.size,
        sort: pageable.sort,
      },
    });
    return response.data;
  },

  // 내 습득물 목록
  getMy: async (): Promise<FoundItem[]> => {
    const response = await apiClient.get('/api/found/my');
    return response.data;
  },

  // 상세 조회
  getById: async (id: number): Promise<FoundItem> => {
    const response = await apiClient.get(`/api/found/${id}`);
    return response.data;
  },

  // 수정
  update: async (id: number, data: FoundItemUpdateRequest): Promise<FoundItem> => {
    const response = await apiClient.put(`/api/found/${id}`, data);
    return response.data;
  },

  // 삭제
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/found/${id}`);
  },

  // 보관 위치 업데이트 (OFFICE 전용)
  updateStorage: async (id: number, storageLocation: string): Promise<FoundItem> => {
    const response = await apiClient.post(`/api/found/${id}/storage`, {
      storageLocation,
    });
    return response.data;
  },

  // 상태 업데이트
  updateStatus: async (id: number, status: string): Promise<FoundItem> => {
    const response = await apiClient.put(`/api/found/${id}/status`, { status });
    return response.data;
  },
};
