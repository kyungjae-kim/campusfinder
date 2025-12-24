export type ReportStatus = 'OPEN' | 'RESOLVED';
export type TargetType = 'LOST' | 'FOUND' | 'MESSAGE';

export interface Report {
  id: number;
  targetType: TargetType;
  targetId: number;
  reporterId: number;
  reporterNickname?: string;
  reason: string;
  status: ReportStatus;
  resolvedBy?: number;
  resolvedAt?: string;
  adminNote?: string;
  createdAt: string;
}

export interface ReportCreateRequest {
  targetType: TargetType;
  targetId: number;
  reason: string;
}

export interface ReportResolveRequest {
  adminNote: string;
  action: 'BLIND' | 'IGNORE';
}
