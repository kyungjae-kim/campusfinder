import {apiClient} from './client';
import type {Handover, HandoverCreateRequest} from '@/types/handover.types';
import type {Page, Pageable} from '@/types/common.types';

export const handoverApi = {
    // 인계 요청 생성
    create: async (data: HandoverCreateRequest): Promise<Handover> => {
        const response = await apiClient.post('/api/handovers', data);
        return response.data;
    },

    // 상세 조회
    getById: async (id: number): Promise<Handover> => {
        const response = await apiClient.get(`/api/handovers/${id}`);
        return response.data;
    },

    // 전체 인계 목록 조회 (관리자용)
    getAllHandovers: async (pageable: Pageable): Promise<Page<Handover>> => {
        const response = await apiClient.get('/api/handovers', {
            params: {
                page: pageable.page,
                size: pageable.size,
                sort: pageable.sort,
            },
        });
        return response.data;
    },

    // 내 인계 요청 목록
    getMyRequests: async (): Promise<Handover[]> => {
        const response = await apiClient.get('/api/handovers/my-requests');
        return response.data;
    },

    // 내 인계 수신함
    getMyResponses: async (): Promise<Handover[]> => {
        const response = await apiClient.get('/api/handovers/my-responses');
        return response.data;
    },

    // 승인 (습득자)
    accept: async (id: number): Promise<Handover> => {
        const response = await apiClient.post(`/api/handovers/${id}/accept`);
        return response.data;
    },

    // 거절 (습득자)
    reject: async (id: number, reason: string): Promise<Handover> => {
        const response = await apiClient.post(`/api/handovers/${id}/reject`, {reason});
        return response.data;
    },

    // 보안 검수
    verify: async (id: number): Promise<Handover> => {
        const response = await apiClient.post(`/api/handovers/${id}/verify`);
        return response.data;
    },

    // 관리실 승인
    approve: async (id: number): Promise<Handover> => {
        const response = await apiClient.post(`/api/handovers/${id}/approve`);
        return response.data;
    },

    // 일정 확정
    schedule: async (id: number, scheduleAt: string, meetPlace: string): Promise<Handover> => {
        const response = await apiClient.post(`/api/handovers/${id}/schedule`, {
            scheduleAt,
            meetPlace,
        });
        return response.data;
    },

    // 완료
    complete: async (id: number): Promise<Handover> => {
        const response = await apiClient.post(`/api/handovers/${id}/complete`);
        return response.data;
    },

    // 취소
    cancel: async (id: number, reason: string): Promise<Handover> => {
        const response = await apiClient.post(`/api/handovers/${id}/cancel`, {reason});
        return response.data;
    },

    // Alias methods for compatibility
    getAll: async (pageable?: Pageable): Promise<Handover[]> => {
        const defaultPageable = { page: 0, size: 100 };
        const result = await handoverApi.getAllHandovers(pageable || defaultPageable);
        return result.content;
    },

    securityVerify: async (id: number): Promise<Handover> => {
        return await handoverApi.verify(id);
    },

    officeApprove: async (id: number): Promise<Handover> => {
        return await handoverApi.approve(id);
    },

    updateCourierStatus: async (id: number, status: string): Promise<Handover> => {
        const response = await apiClient.put(`/api/handovers/${id}/courier-status`, { status });
        return response.data;
    },
};
