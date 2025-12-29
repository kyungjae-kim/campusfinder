import { apiClient } from './client';
import type { MatchingResponse } from '@/types/matching.types';

export const matchingApi = {
  // 분실 신고에 대한 매칭 후보 조회
  getMatchingForLost: async (lostId: number, topN: number = 10): Promise<MatchingResponse[]> => {
    const response = await apiClient.get(`/api/matching/lost/${lostId}`, {
      params: { topN },
    });
    return response.data;
  },

  // 습득물에 대한 매칭 후보 조회
  getMatchingForFound: async (foundId: number, topN: number = 10): Promise<MatchingResponse[]> => {
    const response = await apiClient.get(`/api/matching/found/${foundId}`, {
      params: { topN },
    });
    return response.data;
  },
  
  // Alias for compatibility
  getMatchCandidates: async (lostId: number, topN: number = 10): Promise<any[]> => {
    const response = await matchingApi.getMatchingForLost(lostId, topN);
    // Transform MatchingResponse to MatchCandidate format
    return response.map(item => ({
      foundId: item.foundItem?.id || 0,
      category: item.foundItem?.category || '',
      title: item.foundItem?.title || '',
      description: item.foundItem?.description || '',
      foundAt: item.foundItem?.foundAt || '',
      foundPlace: item.foundItem?.foundPlace || '',
      score: item.score,
      matchReasons: item.reasons,
    }));
  },
};
