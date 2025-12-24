export interface Message {
  id: number;
  handoverId: number;
  senderId: number;
  senderNickname: string;
  content: string;
  isRead: boolean;
  isBlinded: boolean;
  createdAt: string;
}

export interface MessageSendRequest {
  handoverId: number;
  content: string;
}
