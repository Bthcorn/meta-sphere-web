import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';

import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth.store';
import { useAvatarStore } from '@/store/avatar.store';
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
      const hasAvatar = useAvatarStore.getState().avatarId !== null;
      router.navigate({ to: hasAvatar ? '/space' : '/user/avatar-select' });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });

  const logoutMutation = useMutation<void, Error, string | undefined>({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSuccess: (_data, redirectTo) => {
      clearAuth();
      router.navigate({ to: redirectTo ?? '/auth/login', replace: true });
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
