import MarsunCoreProvider from '@/provider/MarsunCoreProvider';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';

afterEach(() => {
  cleanup();
});

function renderProtected(
  auth: {
    isAuthenticated: boolean;
    hasAnyRole?: (roles: string[]) => boolean;
    hasPermission?: (p: string) => boolean;
  },
  ui: React.ReactElement,
  initialPath = '/protected',
) {
  return render(
    <MarsunCoreProvider auth={auth}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/protected" element={ui} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    </MarsunCoreProvider>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects to login when not authenticated', async () => {
    renderProtected({ isAuthenticated: false }, <ProtectedRoute>Protected Content</ProtectedRoute>);
    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  it('renders children when authenticated and no roles required', () => {
    renderProtected({ isAuthenticated: true }, <ProtectedRoute>Protected Content</ProtectedRoute>);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when authenticated and role matches', () => {
    renderProtected(
      { isAuthenticated: true, hasAnyRole: (roles) => roles.includes('SYSTEM_ADMIN') },
      <ProtectedRoute roles={['SYSTEM_ADMIN']}>Admin Panel</ProtectedRoute>,
    );
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('redirects to fallback when role does not match', async () => {
    renderProtected(
      { isAuthenticated: true, hasAnyRole: () => false },
      <ProtectedRoute roles={['SYSTEM_ADMIN']} fallbackPath="/">
        Admin Panel
      </ProtectedRoute>,
    );
    await waitFor(() => {
      expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });
});
