import type { UserRolePermissions } from '@/types/auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  USER_ROLE_PERMISSIONS_KEY,
  getStoredUserPermissions,
  loadUserRolePermissions,
  saveUserRolePermissions,
} from '../permissionStorage';

function createLocalStorageMock() {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
  };
}

function mockUserRolePermissions(permissions: string[], key = 'NORMAL_USER') {
  const payload: UserRolePermissions = {
    key,
    name: '普通用户',
    permissions,
    permCount: permissions.length,
  };
  localStorage.setItem(USER_ROLE_PERMISSIONS_KEY, JSON.stringify(payload));
}

describe('permissionStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads and saves user role permissions', () => {
    mockUserRolePermissions(['file:view', 'file:upload']);
    expect(loadUserRolePermissions()?.permissions).toEqual(['file:view', 'file:upload']);
    saveUserRolePermissions(null);
    expect(loadUserRolePermissions()).toBeNull();
  });

  it('returns stored permission keys', () => {
    mockUserRolePermissions(['file:view']);
    expect(getStoredUserPermissions()).toEqual(['file:view']);
  });
});
