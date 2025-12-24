// 사용자 역할
export type UserRole = 'LOSER' | 'FINDER' | 'OFFICE' | 'SECURITY' | 'ADMIN' | 'COURIER';

// 사용자 상태
export type UserStatus = 'ACTIVE' | 'BLOCKED';

// 사용자 소속
export type Affiliation = 'STUDENT' | 'EXTERNAL' | 'STAFF';

// 페이지네이션
export interface Pageable {
  page: number;
  size: number;
  sort?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
