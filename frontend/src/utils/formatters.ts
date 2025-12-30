// 날짜 포맷팅
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// 날짜시간 포맷팅
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 상대 시간 (예: 3일 전)
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return formatDate(dateString);
};

// 금액 포맷팅
export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
};

// 전화번호 마스킹
export const maskPhone = (phone: string): string => {
  if (!phone) return '';
  if (phone.length < 11) return phone;
  return phone.slice(0, 3) + '-****-' + phone.slice(-4);
};

// 이름 마스킹
export const maskName = (name: string): string => {
  if (!name) return '';
  if (name.length <= 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
};

// 이메일 마스킹
export const maskEmail = (email: string): string => {
  if (!email) return '';
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  const visibleLength = Math.min(3, localPart.length);
  const maskedLocal = localPart.slice(0, visibleLength) + '***';
  return maskedLocal + '@' + domain;
};

// ISO 날짜를 input[type="datetime-local"] 형식으로 변환
export const toDatetimeLocalString = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// 카테고리 레이블 변환 (enum 값 -> 한글)
export const getCategoryLabel = (categoryValue: string): string => {
  const categoryMap: Record<string, string> = {
    'ELECTRONICS': '전자기기',
    'WALLET': '지갑',
    'ID_CARD': '신분증',
    'BAG': '가방',
    'CLOTHING': '의류',
    'BOOK': '책',
    'ACCESSORY': '액세서리',
    'SPORTS': '운동용품',
    'STATIONERY': '문구',
    'ETC': '기타',
  };
  return categoryMap[categoryValue] || categoryValue;
};
