import { useMarsunAuth } from '@/provider';
import type { MaybeFn } from '@/utils/resolveMaybeFn';
import { resolveVisible } from '@/utils/resolveMaybeFn';
import React from 'react';

export type PermissionGuardContext = {
  roles?: string[];
  permission?: string;
};

export interface PermissionGuardProps {
  /** 允许访问的角色列表 */
  roles?: string[];
  /** 允许访问的权限 key */
  permission?: string;
  /** 展示控制 */
  display?: MaybeFn<boolean, PermissionGuardContext>;
  hidden?: MaybeFn<boolean, PermissionGuardContext>;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  roles,
  permission,
  display,
  hidden,
  fallback = null,
  children,
}) => {
  const { hasAnyRole, isAuthenticated, hasPermission } = useMarsunAuth();
  const ctx: PermissionGuardContext = { roles, permission };

  if (!resolveVisible(display, hidden, ctx)) return null;
  if (!isAuthenticated) return <>{fallback}</>;
  if (permission && !hasPermission?.(permission)) return <>{fallback}</>;
  if (roles && roles.length > 0 && !hasAnyRole?.(roles)) return <>{fallback}</>;

  return <>{children}</>;
};

export default PermissionGuard;
