import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../auth.store';

const mockUser = { id: 'abc-123', username: 'johndoe' };
const mockToken = 'eyJhbGciOiJIUzI1NiJ9.test.token';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('starts with null token and user', () => {
    const { token, user } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
  });

  it('setAuth stores token and user', () => {
    useAuthStore.getState().setAuth(mockToken, mockUser);
    const { token, user } = useAuthStore.getState();
    expect(token).toBe(mockToken);
    expect(user).toEqual(mockUser);
  });

  it('clearAuth resets token and user to null', () => {
    useAuthStore.getState().setAuth(mockToken, mockUser);
    useAuthStore.getState().clearAuth();
    const { token, user } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
  });
});
