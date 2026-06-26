import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const mockUseAuthStore = vi.mocked(useAuthStore);

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false, hasAnyRole: vi.fn() } as never);
    renderWithRouter(<ProtectedRoute>Protected Content</ProtectedRoute>);
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated and no roles required', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: true, hasAnyRole: vi.fn() } as never);
    renderWithRouter(<ProtectedRoute>Protected Content</ProtectedRoute>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when authenticated and role matches', () => {
    const hasAnyRole = vi.fn().mockReturnValue(true);
    mockUseAuthStore.mockReturnValue({ isAuthenticated: true, hasAnyRole } as never);
    renderWithRouter(<ProtectedRoute roles={['SYSTEM_ADMIN']}>Admin Panel</ProtectedRoute>);
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('redirects to /dashboard when role does not match', () => {
    const hasAnyRole = vi.fn().mockReturnValue(false);
    mockUseAuthStore.mockReturnValue({ isAuthenticated: true, hasAnyRole } as never);
    renderWithRouter(<ProtectedRoute roles={['SYSTEM_ADMIN']}>Admin Panel</ProtectedRoute>);
    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });
});
