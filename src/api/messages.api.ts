import { api } from '@/lib/api';
import type { ChatMessage } from '@/types/message';

export const messagesApi = {
  getRoomMessages: (roomId: string, limit = 50) =>
    api
      .get<ChatMessage[]>(`/api/messages/room/${roomId}`, { params: { limit } })
      .then((r) => r.data),
};
