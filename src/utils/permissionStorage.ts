import type { PermissionDefinitionsResponse, UserRolePermissions } from '@/types/auth';

export const USER_ROLE_PERMISSIONS_KEY = 'maoyang_user_role_permissions';
export const PERMISSION_DEFINITIONS_KEY = 'maoyang_permission_definitions';

/** @deprecated 使用 USER_ROLE_PERMISSIONS_KEY */
export const PERMISSIONS_STORAGE_KEY = USER_ROLE_PERMISSIONS_KEY;

export function loadUserRolePermissions(): UserRolePermissions | null {
  try {
    const raw = localStorage.getItem(USER_ROLE_PERMISSIONS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUserRolePermissions(data: UserRolePermissions | null) {
  if (data) {
    localStorage.setItem(USER_ROLE_PERMISSIONS_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(USER_ROLE_PERMISSIONS_KEY);
  }
}

export function loadPermissionDefinitions(): PermissionDefinitionsResponse | null {
  try {
    const raw = localStorage.getItem(PERMISSION_DEFINITIONS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePermissionDefinitions(data: PermissionDefinitionsResponse | null) {
  if (data) {
    localStorage.setItem(PERMISSION_DEFINITIONS_KEY, JSON.stringify(data));
  } else {
    localStorage.removeItem(PERMISSION_DEFINITIONS_KEY);
  }
}

/** 当前用户拥有的权限 key 列表 */
export function getStoredUserPermissions(): string[] | null {
  return loadUserRolePermissions()?.permissions ?? null;
}

/** 全量权限 key → name 映射（来自 /permissions/permissions） */
export function getStoredPermissionMap(): Record<string, string> | null {
  return loadPermissionDefinitions()?.permissionMap ?? null;
}
