import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '../auth';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockPost = vi.mocked(api.post);
const mockGet = vi.mocked(api.get);

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login calls POST /api/auth/login and returns data', async () => {
    const response = { access_token: 'token123', user: { id: '1', username: 'johndoe' } };
    mockPost.mockResolvedValueOnce({ data: response });

    const result = await authApi.login({ username: 'johndoe', password: 'pass1234' });

    expect(mockPost).toHaveBeenCalledWith('/api/auth/login', {
      username: 'johndoe',
      password: 'pass1234',
    });
    expect(result).toEqual(response);
  });

  it('register calls POST /api/auth/register and returns data', async () => {
    const payload = {
      username: 'johndoe',
      password: 'pass1234',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };
    const response = { message: 'User created' };
    mockPost.mockResolvedValueOnce({ data: response });

    const result = await authApi.register(payload);

    expect(mockPost).toHaveBeenCalledWith('/api/auth/register', payload);
    expect(result).toEqual(response);
  });

  it('logout calls POST /api/auth/logout and returns data', async () => {
    const response = { message: 'Logged out' };
    mockPost.mockResolvedValueOnce({ data: response });

    const result = await authApi.logout();

    expect(mockPost).toHaveBeenCalledWith('/api/auth/logout');
    expect(result).toEqual(response);
  });

  it('me calls GET /api/auth/me and returns user', async () => {
    const user = { id: '1', username: 'johndoe' };
    mockGet.mockResolvedValueOnce({ data: user });

    const result = await authApi.me();

    expect(mockGet).toHaveBeenCalledWith('/api/auth/me');
    expect(result).toEqual(user);
  });
});
