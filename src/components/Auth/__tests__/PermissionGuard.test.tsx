import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PermissionGuard from '../PermissionGuard';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

const mockUseAuthStore = vi.mocked(useAuthStore);

describe('PermissionGuard', () => {
  it('renders children when no roles specified', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: true, hasAnyRole: vi.fn() } as never);
    render(<PermissionGuard>Content</PermissionGuard>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders fallback when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({ isAuthenticated: false, hasAnyRole: vi.fn() } as never);
    render(<PermissionGuard fallback={<span>No Access</span>}>Content</PermissionGuard>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
    expect(screen.getByText('No Access')).toBeInTheDocument();
  });

  it('renders children when user has matching role', () => {
    const hasAnyRole = vi.fn().mockReturnValue(true);
    mockUseAuthStore.mockReturnValue({ isAuthenticated: true, hasAnyRole } as never);
    render(<PermissionGuard roles={['SYSTEM_ADMIN']}>Admin Content</PermissionGuard>);
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(hasAnyRole).toHaveBeenCalledWith(['SYSTEM_ADMIN']);
  });

  it('renders fallback when user lacks role', () => {
    const hasAnyRole = vi.fn().mockReturnValue(false);
    mockUseAuthStore.mockReturnValue({ isAuthenticated: true, hasAnyRole } as never);
    render(<PermissionGuard roles={['SYSTEM_ADMIN']} fallback={null}>Admin Content</PermissionGuard>);
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders null as default fallback', () => {
    const hasAnyRole = vi.fn().mockReturnValue(false);
    mockUseAuthStore.mockReturnValue({ isAuthenticated: true, hasAnyRole } as never);
    const { container } = render(<PermissionGuard roles={['SYSTEM_ADMIN']}>Hidden</PermissionGuard>);
    expect(container.innerHTML).toBe('');
  });
});
