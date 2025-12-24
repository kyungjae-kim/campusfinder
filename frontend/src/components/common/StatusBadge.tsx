import type { LostStatus } from '@/types/lost.types';
import type { FoundStatus } from '@/types/found.types';
import type { HandoverStatus } from '@/types/handover.types';

type Status = LostStatus | FoundStatus | HandoverStatus;

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; color: string; bg: string }> = {
  // Lost Status
  OPEN: { label: '진행중', color: '#0066cc', bg: '#e6f2ff' },
  MATCHED: { label: '매칭됨', color: '#ff9900', bg: '#fff4e6' },
  CLOSED: { label: '완료', color: '#666', bg: '#f5f5f5' },
  
  // Found Status
  REGISTERED: { label: '등록됨', color: '#0066cc', bg: '#e6f2ff' },
  STORED: { label: '보관중', color: '#00cc66', bg: '#e6fff2' },
  IN_HANDOVER: { label: '인계중', color: '#ff9900', bg: '#fff4e6' },
  HANDED_OVER: { label: '인계완료', color: '#666', bg: '#f5f5f5' },
  DISCARDED: { label: '폐기됨', color: '#cc0000', bg: '#ffe6e6' },
  
  // Handover Status
  REQUESTED: { label: '요청됨', color: '#0066cc', bg: '#e6f2ff' },
  ACCEPTED_BY_FINDER: { label: '습득자승인', color: '#00cc66', bg: '#e6fff2' },
  VERIFIED_BY_SECURITY: { label: '보안검수완료', color: '#9933ff', bg: '#f2e6ff' },
  APPROVED_BY_OFFICE: { label: '관리실승인', color: '#00cc99', bg: '#e6fff9' },
  SCHEDULED: { label: '일정확정', color: '#ff9900', bg: '#fff4e6' },
  COMPLETED: { label: '완료', color: '#666', bg: '#f5f5f5' },
  CANCELED: { label: '취소됨', color: '#cc0000', bg: '#ffe6e6' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  if (!config) {
    return <span>{status}</span>;
  }
  
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '500',
      color: config.color,
      backgroundColor: config.bg,
    }}>
      {config.label}
    </span>
  );
}
