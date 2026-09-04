/** SSO / IAM 页面用类型（无 fetch；由 App 的 IamClient 填充） */

export type IamUser = {
  id: string;
  employeeId: string;
  displayName: string;
  email?: string | null;
  isActive: boolean;
  roles?: {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    systemAppId?: string | null;
  }[];
  orgs?: { id: string; name: string; isPrimary?: boolean }[];
};

export type IamRole = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  systemAppId?: string | null;
  isBuiltin?: boolean;
  userRoleCount?: number;
  rolePermissions?: {
    permissionId: string;
    permission?: { id: string; code: string; name: string; layer?: string };
  }[];
  _count?: { userRoles?: number };
};

export type IamOrgUnit = {
  id: string;
  name: string;
  parentId?: string | null;
  children?: IamOrgUnit[];
};

export type IamPermission = {
  id: string;
  code: string;
  name: string;
  systemAppId?: string | null;
  layer?: string;
  systemApp?: { code?: string };
};

export type IamSharedGroup = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  systemAppId?: string | null;
  memberCount?: number;
  moduleAccess?: { moduleKey: string; access: 'read' | 'write' }[] | null;
  groupRoles?: { role?: { id: string; code: string; name: string } | null }[];
  _count?: { userGroups?: number };
};

export type IamUsersPageResult = {
  pageData: IamUser[];
  currentPage: number;
  pageSize: number;
  total: number;
};
