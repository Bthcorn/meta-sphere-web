import { api } from '@/lib/api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth';

const AUTH_PREFIX = '/api/auth';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>(`${AUTH_PREFIX}/login`, data).then((res) => res.data),

  register: (data: RegisterRequest) =>
    api.post<{ message: string }>(`${AUTH_PREFIX}/register`, data).then((res) => res.data),

  logout: () => api.post<{ message: string }>(`${AUTH_PREFIX}/logout`).then((res) => res.data),

  me: () => api.get<User>(`${AUTH_PREFIX}/me`).then((res) => res.data),
};
