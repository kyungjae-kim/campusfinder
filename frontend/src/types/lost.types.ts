export type LostStatus = 'OPEN' | 'MATCHED' | 'CLOSED';

export interface LostItem {
  id: number;
  userId: number;
  category: string;
  title: string;
  description: string;
  lostAt: string;
  lostPlace: string;
  reward?: number;
  status: LostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LostItemCreateRequest {
  category: string;
  title: string;
  description: string;
  lostAt: string;
  lostPlace: string;
  reward?: number;
}

export interface LostItemUpdateRequest {
  category?: string;
  title?: string;
  description?: string;
  lostAt?: string;
  lostPlace?: string;
  reward?: number;
}
