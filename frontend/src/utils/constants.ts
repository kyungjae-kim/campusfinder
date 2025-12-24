// 카테고리 목록 (백엔드 Category enum과 일치)
export const CATEGORIES = [
  { value: 'ELECTRONICS', label: '전자기기', requiresSecurityCheck: true },
  { value: 'WALLET', label: '지갑', requiresSecurityCheck: true },
  { value: 'ID_CARD', label: '신분증', requiresSecurityCheck: true },
  { value: 'BAG', label: '가방', requiresSecurityCheck: false },
  { value: 'CLOTHING', label: '의류', requiresSecurityCheck: false },
  { value: 'BOOK', label: '책', requiresSecurityCheck: false },
  { value: 'ACCESSORY', label: '액세서리', requiresSecurityCheck: false },
  { value: 'SPORTS', label: '운동용품', requiresSecurityCheck: false },
  { value: 'STATIONERY', label: '문구', requiresSecurityCheck: false },
  { value: 'ETC', label: '기타', requiresSecurityCheck: false },
] as const;

// 장소 목록 (예시)
export const PLACES = [
  '공학관',
  '중앙도서관',
  '학생회관',
  '기숙사',
  '체육관',
  '식당',
  '강의실',
  '운동장',
  '기타',
] as const;

// 보관 방식
export const STORAGE_TYPES = [
  { value: 'SELF', label: '직접 보관' },
  { value: 'OFFICE', label: '관리실 보관' },
  { value: 'SECURITY', label: '보안실 보관' },
  { value: 'LOCKER', label: '보관함' },
] as const;

// 인계 방법
export const HANDOVER_METHODS = [
  { value: 'MEET', label: '대면 인계' },
  { value: 'OFFICE', label: '관리실 인계' },
  { value: 'COURIER', label: '배송 인계' },
] as const;
