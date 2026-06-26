import { useMarsunAuth } from '@/provider';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export interface ProtectedRouteProps {
  roles?: string[];
  permission?: string;
  loginPath?: string;
  fallbackPath?: string;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  roles,
  permission,
  loginPath = '/login',
  fallbackPath = '/',
  children,
}) => {
  const { isAuthenticated, hasAnyRole, hasPermission } = useMarsunAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to={`${loginPath}?redirect=${redirect}`} replace />;
  }

  if (roles && roles.length > 0 && !hasAnyRole?.(roles)) {
    return <Navigate to={fallbackPath} replace />;
  }

  if (permission && !hasPermission?.(permission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
