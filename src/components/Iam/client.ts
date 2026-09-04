import type {
  IamOrgUnit,
  IamPermission,
  IamRole,
  IamSharedGroup,
  IamUser,
  IamUsersPageResult,
} from './types';

/**
 * App 侧 `ssoIam.ts` 实现本接口；core 页面只依赖注入对象，不内置 fetch。
 */
export type IamClient = {
  listUsers: (params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  }) => Promise<IamUsersPageResult>;
  getUser: (id: string) => Promise<IamUser>;
  listRoles: () => Promise<IamRole[]>;
  createRole: (body: { name: string; description?: string }) => Promise<IamRole>;
  updateRole: (id: string, body: { name?: string; description?: string }) => Promise<IamRole>;
  deleteRole: (id: string) => Promise<void>;
  setRolePermissions: (roleId: string, permissionIds: string[]) => Promise<void>;
  listPermissions: () => Promise<IamPermission[]>;
  listOrgUnits: () => Promise<IamOrgUnit[]>;
  listSharedGroups: () => Promise<IamSharedGroup[]>;
  createSharedGroup: (body: {
    code: string;
    name: string;
    description?: string;
    roleIds?: string[];
  }) => Promise<IamSharedGroup>;
  updateSharedGroup: (
    id: string,
    body: { name?: string; description?: string },
  ) => Promise<IamSharedGroup>;
  deleteSharedGroup: (id: string) => Promise<void>;
  addSharedGroupMembers: (groupId: string, userIds: string[]) => Promise<void>;
  removeSharedGroupMembers: (groupId: string, userIds: string[]) => Promise<void>;
  listUserSharedGroups: (userId: string) => Promise<IamSharedGroup[]>;
  setUserAppRoleCodes: (userId: string, roleCodes: string[]) => Promise<void>;
  setUserSharedGroups: (userId: string, groupIds: string[]) => Promise<void>;
};
