import MarsunCoreProvider from '@/provider/MarsunCoreProvider';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import PermissionGuard from '../PermissionGuard';

afterEach(() => {
  cleanup();
});

function renderGuard(
  auth: {
    isAuthenticated: boolean;
    hasAnyRole?: (roles: string[]) => boolean;
    hasPermission?: (p: string) => boolean;
  },
  ui: React.ReactElement,
) {
  return render(<MarsunCoreProvider auth={auth}>{ui}</MarsunCoreProvider>);
}

describe('PermissionGuard', () => {
  it('renders children when no roles specified', () => {
    renderGuard({ isAuthenticated: true }, <PermissionGuard>Content</PermissionGuard>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders fallback when not authenticated', () => {
    renderGuard(
      { isAuthenticated: false },
      <PermissionGuard fallback={<span>No Access</span>}>Content</PermissionGuard>,
    );
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
    expect(screen.getByText('No Access')).toBeInTheDocument();
  });

  it('renders children when user has matching role', () => {
    const hasAnyRole = (roles: string[]) => roles.includes('SYSTEM_ADMIN');
    renderGuard(
      { isAuthenticated: true, hasAnyRole },
      <PermissionGuard roles={['SYSTEM_ADMIN']}>Admin Content</PermissionGuard>,
    );
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders fallback when user lacks role', () => {
    renderGuard(
      { isAuthenticated: true, hasAnyRole: () => false },
      <PermissionGuard roles={['SYSTEM_ADMIN']} fallback={null}>
        Admin Content
      </PermissionGuard>,
    );
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders null as default fallback', () => {
    const { container } = renderGuard(
      { isAuthenticated: true, hasAnyRole: () => false },
      <PermissionGuard roles={['SYSTEM_ADMIN']}>Hidden</PermissionGuard>,
    );
    expect(container.innerHTML).toBe('');
  });
});
