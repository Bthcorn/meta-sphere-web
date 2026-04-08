import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth.store';
import { useAvatarStore } from '@/store/avatar.store';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}));

vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

const mockLogin = vi.mocked(authApi.login);
const mockRegister = vi.mocked(authApi.register);
const mockLogout = vi.mocked(authApi.logout);

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
  return { Wrapper };
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
    useAvatarStore.setState({
      avatarId: null,
      glassesId: 'none',
      hatId: 'none',
      shirtColorId: 'slate',
    });
  });

  // ── Selector exposure ──────────────────────────────────────────────────────

  it('exposes token, user, and isAuthenticated from the auth store', () => {
    useAuthStore.setState({
      token: 'tok',
      user: { id: '1', username: 'alice' },
      isAuthenticated: true,
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    expect(result.current.token).toBe('tok');
    expect(result.current.user).toEqual({ id: '1', username: 'alice' });
    expect(result.current.isAuthenticated).toBe(true);
  });

  // ── login ──────────────────────────────────────────────────────────────────

  it('calls authApi.login with the provided credentials', async () => {
    mockLogin.mockResolvedValueOnce({ access_token: 'tok', user: { id: '1', username: 'alice' } });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await act(async () => {
      result.current.login.mutate({ username: 'alice', password: 'secret' });
    });

    await waitFor(() => expect(result.current.login.isSuccess).toBe(true));
    expect(mockLogin).toHaveBeenCalledWith({ username: 'alice', password: 'secret' });
  });

  it('stores auth in the store and navigates to /space when avatar is set', async () => {
    useAvatarStore.setState({
      avatarId: 'fair',
      glassesId: 'none',
      hatId: 'none',
      shirtColorId: 'slate',
    });
    mockLogin.mockResolvedValueOnce({ access_token: 'tok', user: { id: '1', username: 'alice' } });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await act(async () => {
      result.current.login.mutate({ username: 'alice', password: 'pass' });
    });

    await waitFor(() => expect(result.current.login.isSuccess).toBe(true));
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/space' });
  });

  it('navigates to /user/avatar-select when no avatar is set after login', async () => {
    // avatarId is null (default)
    mockLogin.mockResolvedValueOnce({ access_token: 'tok', user: { id: '1', username: 'alice' } });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await act(async () => {
      result.current.login.mutate({ username: 'alice', password: 'pass' });
    });

    await waitFor(() => expect(result.current.login.isSuccess).toBe(true));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/user/avatar-select' });
  });

  // ── register ───────────────────────────────────────────────────────────────

  it('calls authApi.register with the provided data', async () => {
    mockRegister.mockResolvedValueOnce({ access_token: 'tok', user: { id: '2', username: 'bob' } });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    const dto = {
      username: 'bob',
      password: 'secret',
      email: 'bob@example.com',
      firstName: 'Bob',
      lastName: 'Smith',
    };

    await act(async () => {
      result.current.register.mutate(dto);
    });

    await waitFor(() => expect(result.current.register.isSuccess).toBe(true));
    expect(mockRegister).toHaveBeenCalledWith(dto);
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  it('calls authApi.logout, clears auth store, and navigates to /auth/login by default', async () => {
    useAuthStore.setState({
      token: 'tok',
      user: { id: '1', username: 'alice' },
      isAuthenticated: true,
    });
    mockLogout.mockResolvedValueOnce(undefined);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await act(async () => {
      result.current.logout.mutate(undefined);
    });

    await waitFor(() => expect(result.current.logout.isSuccess).toBe(true));
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/auth/login', replace: true });
  });

  it('navigates to a custom redirect path after logout', async () => {
    mockLogout.mockResolvedValueOnce(undefined);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await act(async () => {
      result.current.logout.mutate('/home');
    });

    await waitFor(() => expect(result.current.logout.isSuccess).toBe(true));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/home', replace: true });
  });
});
