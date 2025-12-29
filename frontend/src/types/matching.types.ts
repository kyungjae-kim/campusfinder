import type { LostItem } from './lost.types';
import type { FoundItem } from './found.types';

// 매칭 후보 결과
export interface MatchingResponse {
  lostItem?: LostItem;
  foundItem?: FoundItem;
  score: number;
  reasons: string[];
}

// 매칭 후보 (FoundItem 확장)
export interface MatchCandidate {
  foundId: number;
  category: string;
  title: string;
  description: string;
  foundAt: string;
  foundPlace: string;
  score: number;
  matchReasons?: string[];
}

// 매칭 점수 기준
export interface MatchingScore {
  categoryMatch: boolean;
  locationMatch: boolean;
  dateProximity: number;
  keywordMatch: number;
  totalScore: number;
}
