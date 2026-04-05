import { api } from '@/lib/api';
import type { CreateSessionDto, Session, Participant } from '@/types/session';
import type { SessionStatus } from '@/types/session';

interface ListSessionsParams {
  roomId?: string;
  status?: SessionStatus;
}

export const sessionsApi = {
  list: (params?: ListSessionsParams) =>
    api.get<Session[]>('/api/sessions', { params }).then((r) => r.data),

  get: (id: string) => api.get<Session>(`/api/sessions/${id}`).then((r) => r.data),

  create: (dto: CreateSessionDto) => api.post<Session>('/api/sessions', dto).then((r) => r.data),

  update: (id: string, dto: Partial<Pick<Session, 'title' | 'description' | 'isLocked'>>) =>
    api.patch<Session>(`/api/sessions/${id}`, dto).then((r) => r.data),

  start: (id: string) => api.post<Session>(`/api/sessions/${id}/start`).then((r) => r.data),

  end: (id: string) => api.post<Session>(`/api/sessions/${id}/end`).then((r) => r.data),

  join: (id: string, password?: string, inviteToken?: string) =>
    api
      .post<{ message: string }>(`/api/sessions/${id}/join`, { password, inviteToken })
      .then((r) => r.data),

  leave: (id: string) =>
    api.post<{ message: string }>(`/api/sessions/${id}/leave`).then((r) => r.data),

  getParticipants: (id: string) =>
    api.get<Participant[]>(`/api/sessions/${id}/participants`).then((r) => r.data),

  kick: (id: string, userId: string) =>
    api.delete(`/api/sessions/${id}/participants/${userId}`).then((r) => r.data),
};
