/** Shape emitted by the backend ChatGateway `chat:message` event (Prisma Message + sender relation). */
export interface ChatMessage {
  id: string;
  content: string;
  type: 'TEXT' | 'FILE' | 'SYSTEM';
  isDeleted: boolean;
  isEdited: boolean;
  reactions: Record<string, string[]>; // { '👍': ['userId1', 'userId2'] }
  createdAt: string;
  roomId: string | null;
  sessionId: string | null;
  receiverId: string | null;
  sender: {
    id: string;
    username: string;
    avatarPreset?: string;
  };
}

/** Shape emitted by the backend ChatGateway `chat:typing` event. */
export interface TypingIndicator {
  userId: string;
  username: string;
  isTyping: boolean;
}

/** Shape emitted by the backend ChatGateway `chat:reaction` event. */
export interface ChatReaction {
  messageId: string;
  reactions: Record<string, string[]>;
}
