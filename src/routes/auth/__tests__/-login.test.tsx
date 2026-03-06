import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/render-utils';
import { useAuthStore } from '@/store/auth.store';

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------
const mockNavigate = vi.hoisted(() => vi.fn());
const mockLogin = vi.hoisted(() => vi.fn());

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (opts: unknown) => opts,
  useNavigate: () => mockNavigate,
  useRouter: () => ({ navigate: mockNavigate }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    React.createElement('a', { href: to }, children),
}));

vi.mock('@/api/auth', () => ({
  authApi: { login: mockLogin },
}));

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------
const { Route } = await import('../login');
const LoginPage = (Route as unknown as { component: React.ComponentType }).component;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
  });

  it('renders heading, fields, submit button and register link', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByRole('heading', { name: /metasphere/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create one/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('calls authApi.login with correct values on valid submit', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      access_token: 'token123',
      user: { id: '1', username: 'johndoe' },
    });
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/password/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'johndoe',
        password: 'SecurePassword123!',
      });
    });
  });

  it('stores auth and navigates to /space on successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      access_token: 'token123',
      user: { id: '1', username: 'johndoe' },
    });
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/password/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(useAuthStore.getState().token).toBe('token123');
      expect(useAuthStore.getState().user?.username).toBe('johndoe');
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/space' });
    });
  });

  it('shows API error message on login failure', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/password/i), 'WrongPassword!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('disables button and shows loading text while pending', async () => {
    const user = userEvent.setup();
    mockLogin.mockReturnValueOnce(new Promise(() => {})); // never resolves
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/username/i), 'johndoe');
    await user.type(screen.getByLabelText(/password/i), 'SecurePassword123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /signing in/i });
      expect(btn).toBeDisabled();
    });
  });
});
