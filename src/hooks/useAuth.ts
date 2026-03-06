import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth.store';
import type { LoginRequest, RegisterRequest } from '@/types/auth';

export function useAuth() {
  const router = useRouter();

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: ({ access_token, user }) => {
      setAuth(access_token, user);
      router.navigate({ to: '/' });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      router.navigate({ to: '/auth/login' });
    },
  });

  return {
    token,
    user,
    isAuthenticated,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}
