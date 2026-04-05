import { api } from '@/lib/api';
import type { FriendEntry, PendingFriendRequest } from '@/types/friend';

export const friendsApi = {
  getAll: () => api.get<FriendEntry[]>('/api/friends').then((r) => r.data),

  getOnline: () => api.get<FriendEntry[]>('/api/friends/online').then((r) => r.data),

  getPendingRequests: () =>
    api.get<PendingFriendRequest[]>('/api/friends/requests').then((r) => r.data),

  sendRequest: (userId: string) => api.post(`/api/friends/request/${userId}`).then((r) => r.data),

  accept: (requestId: string) => api.post(`/api/friends/accept/${requestId}`).then((r) => r.data),

  decline: (requestId: string) => api.post(`/api/friends/decline/${requestId}`).then((r) => r.data),

  remove: (userId: string) => api.delete(`/api/friends/${userId}`).then((r) => r.data),
};
