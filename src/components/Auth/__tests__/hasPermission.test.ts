import type { UserInfo, UserRolePermissions } from '@/types';
import { UserRole } from '@/types';
import { USER_ROLE_PERMISSIONS_KEY } from '@/utils/permissionStorage';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hasPermission } from '../hasPermission';

const baseUser: UserInfo = {
  id: '1',
  employeeId: 'EMP001',
  displayName: 'Test User',
  email: 'test@test.com',
  role: UserRole.NORMAL_USER,
  departmentId: 'dept1',
  departmentName: 'Test Dept',
  memberStatus: 'ACTIVE' as never,
  createdAt: '2024-01-01',
};

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

describe('hasPermission', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false for null user', () => {
    expect(hasPermission(null, 'file:view')).toBe(false);
  });

  it('returns false when permissions are not loaded', () => {
    expect(hasPermission(baseUser, 'file:view')).toBe(false);
  });

  it('SYSTEM_ADMIN has all listed permissions', () => {
    mockUserRolePermissions(['file:view', 'system:admin', 'nonexistent:perm'], 'SYSTEM_ADMIN');
    const admin = { ...baseUser, role: UserRole.SYSTEM_ADMIN };
    expect(hasPermission(admin, 'file:view')).toBe(true);
    expect(hasPermission(admin, 'system:admin')).toBe(true);
    expect(hasPermission(admin, 'nonexistent:perm')).toBe(true);
  });

  it('NORMAL_USER has limited permissions', () => {
    mockUserRolePermissions(['file:view', 'file:upload', 'user:view']);
    expect(hasPermission(baseUser, 'file:view')).toBe(true);
    expect(hasPermission(baseUser, 'file:upload')).toBe(true);
    expect(hasPermission(baseUser, 'user:delete')).toBe(false);
    expect(hasPermission(baseUser, 'review:approve')).toBe(false);
  });

  it('REVIEWER has review permissions', () => {
    mockUserRolePermissions(['review:approve', 'review:reject']);
    const reviewer = { ...baseUser, role: UserRole.REVIEWER };
    expect(hasPermission(reviewer, 'review:approve')).toBe(true);
    expect(hasPermission(reviewer, 'review:reject')).toBe(true);
    expect(hasPermission(reviewer, 'system:admin')).toBe(false);
  });

  it('DEPT_LEADER has dept manage permission', () => {
    mockUserRolePermissions(['dept:manage', 'feedback:manage']);
    const leader = { ...baseUser, role: UserRole.DEPT_LEADER };
    expect(hasPermission(leader, 'dept:manage')).toBe(true);
    expect(hasPermission(leader, 'feedback:manage')).toBe(true);
    expect(hasPermission(leader, 'system:admin')).toBe(false);
  });
});
