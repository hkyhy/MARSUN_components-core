import MarsunCoreProvider from '@/provider/MarsunCoreProvider';
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import Permissions, { computedIsPass, usePermissions, usePermissionsPass } from '../Permissions';

afterEach(() => {
  cleanup();
});

function renderWithAuth(
  auth: {
    isAuthenticated?: boolean;
    permissions?: string[];
    hasPermission?: (p: string) => boolean;
  },
  ui: ReactElement,
) {
  return render(
    <MarsunCoreProvider
      auth={{
        isAuthenticated: auth.isAuthenticated ?? true,
        permissions: auth.permissions,
        hasPermission: auth.hasPermission,
      }}
    >
      {ui}
    </MarsunCoreProvider>,
  );
}

describe('computedIsPass', () => {
  it('returns true when request is empty', () => {
    expect(computedIsPass({ permissions: [], request: [] })).toBe(true);
    expect(computedIsPass({ permissions: ['a'], request: undefined })).toBe(true);
  });

  it('uses OR semantics for string arrays', () => {
    expect(computedIsPass({ permissions: ['a', 'b'], request: ['b', 'c'] })).toBe(true);
    expect(computedIsPass({ permissions: ['a'], request: ['b', 'c'] })).toBe(false);
  });

  it('supports function request', () => {
    expect(
      computedIsPass({
        permissions: ['user:view'],
        request: (perms) => perms.includes('user:view'),
      }),
    ).toBe(true);
    expect(
      computedIsPass({
        permissions: [],
        request: () => false,
      }),
    ).toBe(false);
  });
});

describe('Permissions', () => {
  it('renders children when permission passes', () => {
    renderWithAuth(
      { permissions: ['user:view'] },
      <Permissions request={['user:view']}>Visible</Permissions>,
    );
    expect(screen.getByText('Visible')).toBeInTheDocument();
  });

  it('hides children by default when not pass', () => {
    const { container } = renderWithAuth(
      { permissions: ['user:view'] },
      <Permissions request={['user:delete']}>Hidden</Permissions>,
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(container.innerHTML).toBe('');
  });

  it('shows Result when type is error', () => {
    renderWithAuth(
      { permissions: [] },
      <Permissions type="error" request={['admin']} message="无权访问">
        Content
      </Permissions>,
    );
    expect(screen.getByText('无权访问')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('wraps children with tooltip overlay when type is tooltip', () => {
    const { container } = renderWithAuth(
      { permissions: [] },
      <Permissions type="tooltip" request={['admin']} message="暂无权限">
        <button type="button">Action</button>
      </Permissions>,
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(container.querySelector('.permissions-outer')).toBeTruthy();
  });

  it('supports function children', () => {
    renderWithAuth(
      { permissions: ['user:view'] },
      <Permissions request={['user:view']}>
        {({ isPass }) => <span>{isPass ? 'pass' : 'fail'}</span>}
      </Permissions>,
    );
    expect(screen.getByText('pass')).toBeInTheDocument();
  });

  it('falls back to hasPermission when permissions list is empty', () => {
    renderWithAuth(
      { permissions: [], hasPermission: (k) => k === 'user:edit' },
      <Permissions request={['user:edit']}>Edit</Permissions>,
    );
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });
});

describe('hooks', () => {
  it('usePermissions returns injected list', () => {
    const Probe = () => {
      const { permissions } = usePermissions();
      return <span data-testid="perms">{permissions.join(',')}</span>;
    };
    renderWithAuth({ permissions: ['a', 'b'] }, <Probe />);
    expect(screen.getByTestId('perms').textContent).toBe('a,b');
  });

  it('usePermissionsPass checks request', () => {
    const Probe = () => {
      const ok = usePermissionsPass({ request: ['x'] });
      return <span>{ok ? 'yes' : 'no'}</span>;
    };
    renderWithAuth({ permissions: ['x'] }, <Probe />);
    expect(screen.getByText('yes')).toBeInTheDocument();
  });
});
