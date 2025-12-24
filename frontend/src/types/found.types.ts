export type FoundStatus = 'REGISTERED' | 'STORED' | 'IN_HANDOVER' | 'HANDED_OVER' | 'DISCARDED';
export type StorageType = 'SELF' | 'OFFICE' | 'SECURITY' | 'LOCKER';

export interface FoundItem {
  id: number;
  ownerUserId: number;
  category: string;
  title: string;
  description: string;
  foundAt: string;
  foundPlace: string;
  storageType: StorageType;
  storageLocation: string;
  status: FoundStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FoundItemCreateRequest {
  category: string;
  title: string;
  description: string;
  foundAt: string;
  foundPlace: string;
  storageType: StorageType;
  storageLocation: string;
}

export interface FoundItemUpdateRequest {
  category?: string;
  title?: string;
  description?: string;
  foundAt?: string;
  foundPlace?: string;
  storageType?: StorageType;
  storageLocation?: string;
}
