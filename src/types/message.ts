export interface ChatMessage {
  id: string;
  content: string;
  roomId: string | null;
  senderId: string;
  recipientId: string | null;
  type: 'TEXT' | 'FILE' | 'SYSTEM';
  reactions: string[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarPreset?: string;
  };
}

export interface TypingIndicator {
  userId: string;
  username: string;
}
