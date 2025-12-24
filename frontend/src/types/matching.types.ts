import type { LostItem } from './lost.types';
import type { FoundItem } from './found.types';

// 매칭 후보 결과
export interface MatchingResponse {
  lostItem?: LostItem;
  foundItem?: FoundItem;
  score: number;
  reasons: string[];
}

// 매칭 점수 기준
export interface MatchingScore {
  categoryMatch: boolean;
  locationMatch: boolean;
  dateProximity: number;
  keywordMatch: number;
  totalScore: number;
}
