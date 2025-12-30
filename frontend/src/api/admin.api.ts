import { apiClient } from './client';
import type { Report, ReportCreateRequest, ReportResolveRequest } from '@/types/report.types';
import type { Page, Pageable } from '@/types/common.types';

export const adminApi = {
  // ========== 신고 관리 ==========
  
  // 신고 등록
  createReport: async (data: ReportCreateRequest): Promise<Report> => {
    const response = await apiClient.post('/api/admin/reports', data);
    return response.data;
  },

  // 신고 목록
  getReports: async (status?: string, pageable?: Pageable): Promise<Page<Report>> => {
    const response = await apiClient.get('/api/admin/reports', {
      params: {
        status,
        page: pageable?.page || 0,
        size: pageable?.size || 20,
      },
    });
    return response.data;
  },

  // 신고 상세
  getReport: async (id: number): Promise<Report> => {
    const response = await apiClient.get(`/api/admin/reports/${id}`);
    return response.data;
  },

  // 신고 처리
  resolveReport: async (id: number, data: ReportResolveRequest): Promise<Report> => {
    const response = await apiClient.put(`/api/admin/reports/${id}/resolve`, data);
    return response.data;
  },

  // ========== 블라인드 처리 ==========
  
  // 게시물/메시지 블라인드
  blindItem: async (targetType: string, targetId: number): Promise<void> => {
    await apiClient.post(`/api/admin/items/${targetType}/${targetId}/blind`);
  },

  // 블라인드 해제
  unblindItem: async (targetType: string, targetId: number): Promise<void> => {
    await apiClient.post(`/api/admin/items/${targetType}/${targetId}/unblind`);
  },

  // ========== 사용자 제재 ==========
  
  // 사용자 목록 조회
  getUsers: async (): Promise<any[]> => {
    const response = await apiClient.get('/api/users');
    return response.data.content || response.data;
  },

  // 사용자 정지
  blockUser: async (userId: number): Promise<void> => {
    await apiClient.post(`/api/admin/users/${userId}/block`);
  },

  // 사용자 정지 해제
  unblockUser: async (userId: number): Promise<void> => {
    await apiClient.post(`/api/admin/users/${userId}/unblock`);
  },

  // blindContent alias for compatibility
  blindContent: async (targetType: string, targetId: number): Promise<void> => {
    await apiClient.post(`/api/admin/items/${targetType}/${targetId}/blind`);
  },

  // ========== 운영 통계 ==========
  
  // 운영 통계
  getStatistics: async (startDate?: string, endDate?: string): Promise<any> => {
    const response = await apiClient.get('/api/admin/statistics', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
