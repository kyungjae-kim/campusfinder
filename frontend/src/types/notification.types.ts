export type NotificationType = 
  | 'LOST_CREATED'
  | 'FOUND_CREATED'
  | 'MATCHING_FOUND'
  | 'HANDOVER_REQUESTED'
  | 'HANDOVER_ACCEPTED'
  | 'HANDOVER_REJECTED'
  | 'HANDOVER_SCHEDULED'
  | 'HANDOVER_COMPLETED'
  | 'SECURITY_VERIFIED'
  | 'OFFICE_APPROVED'
  | 'ADMIN_ACTION';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationCreateRequest {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: string;
}
