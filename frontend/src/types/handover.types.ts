export type HandoverStatus = 
  | 'REQUESTED'
  | 'ACCEPTED_BY_FINDER'
  | 'VERIFIED_BY_SECURITY'
  | 'APPROVED_BY_OFFICE'
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELED';

export type HandoverMethod = 'MEET' | 'OFFICE' | 'COURIER';

export interface Handover {
  id: number;
  lostId: number;
  foundId: number;
  requesterId: number;
  responderId: number;
  method: HandoverMethod;
  scheduleAt?: string;
  meetPlace?: string;
  status: HandoverStatus;
  acceptedByFinderAt?: string;
  verifiedBySecurityAt?: string;
  approvedByOfficeAt?: string;
  completedAt?: string;
  canceledAt?: string;
  cancelReason?: string;
  contactDisclosed?: boolean;
  createdAt: string;
  updatedAt?: string;

  // 추가 필드 (DTO에서 포함될 수 있음)
  lostTitle?: string;
  foundTitle?: string;
  requesterName?: string;
  responderName?: string;
  courierStatus?: string;
  deliveryAddress?: string;
}

export interface HandoverCreateRequest {
  lostId: number;
  foundId: number;
  method: HandoverMethod;
  message?: string;
}
