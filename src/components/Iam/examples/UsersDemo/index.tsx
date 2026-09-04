import type { PermissionBindCatalog } from '@/components/PermissionBindPanel';
import type { IamClient } from '../../client';
import type { IamRole, IamSharedGroup, IamUser } from '../../types';
import IamUsersPage from '../../pages/IamUsersPage';

const demoCatalog: PermissionBindCatalog = {
  systemAppCode: 'agent-app',
  modules: [
    {
      key: 'entry',
      label: '系统入口',
      categories: [
        {
          key: 'sys',
          label: '入口',
          leaves: [{ code: 'sys:agent-app', label: '进入应用' }],
        },
      ],
    },
    {
      key: 'home',
      label: '工作台',
      requiresSystemEntry: true,
      categories: [
        {
          key: 'menu',
          label: '菜单',
          leaves: [
            { code: 'app:menu:home', label: '首页' },
            { code: 'app:example:read', label: '示例读' },
          ],
        },
      ],
    },
  ],
};

const users: IamUser[] = [
  {
    id: 'u1',
    employeeId: '10001',
    displayName: '演示用户',
    email: 'demo@example.com',
    isActive: true,
    roles: [{ id: 'r1', code: 'ADMIN', name: '管理员' }],
    orgs: [{ id: 'o1', name: '总部', isPrimary: true }],
  },
];

const roles: IamRole[] = [
  {
    id: 'r1',
    code: 'ADMIN',
    name: '管理员',
    rolePermissions: [
      {
        permissionId: 'p1',
        permission: {
          id: 'p1',
          code: 'sys:agent-app',
          name: '进入应用',
          layer: 'SYSTEM',
        },
      },
      {
        permissionId: 'p2',
        permission: {
          id: 'p2',
          code: 'app:menu:home',
          name: '首页',
          layer: 'BUSINESS',
        },
      },
    ],
  },
];

const groups: IamSharedGroup[] = [
  {
    id: 'g1',
    code: 'ops',
    name: '运维组',
    groupRoles: [{ role: { id: 'r1', code: 'ADMIN', name: '管理员' } }],
    _count: { userGroups: 1 },
  },
];

const mockClient: IamClient = {
  listUsers: async () => ({
    pageData: users,
    currentPage: 1,
    pageSize: 20,
    total: users.length,
  }),
  getUser: async (id) => users.find((u) => u.id === id) ?? users[0]!,
  listRoles: async () => roles,
  createRole: async (body) => ({ id: 'new', code: 'NEW', name: body.name }),
  updateRole: async (id, body) => ({ id, code: 'ADMIN', name: body.name || '管理员' }),
  deleteRole: async () => undefined,
  setRolePermissions: async () => undefined,
  listPermissions: async () => [
    { id: 'p1', code: 'sys:agent-app', name: '进入应用', layer: 'SYSTEM' },
    { id: 'p2', code: 'app:menu:home', name: '首页', layer: 'BUSINESS' },
  ],
  listOrgUnits: async () => [{ id: 'o1', name: '总部', parentId: null }],
  listSharedGroups: async () => groups,
  createSharedGroup: async (body) => ({
    id: 'g-new',
    code: body.code,
    name: body.name,
  }),
  updateSharedGroup: async (id, body) => ({
    id,
    code: 'ops',
    name: body.name || '运维组',
  }),
  deleteSharedGroup: async () => undefined,
  addSharedGroupMembers: async () => undefined,
  removeSharedGroupMembers: async () => undefined,
  listUserSharedGroups: async () => groups,
  setUserAppRoleCodes: async () => undefined,
  setUserSharedGroups: async () => undefined,
};

export default function UsersDemo() {
  return (
    <IamUsersPage
      client={mockClient}
      catalog={demoCatalog}
      systemEntryCodes={['sys:agent-app']}
      tableName="showcase_iam_users"
    />
  );
}
