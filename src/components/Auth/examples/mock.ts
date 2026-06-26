/** Auth 权限配置示例 */
export const PERMISSION_CONFIG = {
  /** 系统权限列表 */
  permissions: [
    { key: 'file:view', label: '查看文件', module: '文件管理' },
    { key: 'file:upload', label: '上传文件', module: '文件管理' },
    { key: 'file:delete', label: '删除文件', module: '文件管理' },
    { key: 'file:submit', label: '提报审核', module: '文件管理' },
    { key: 'review:view', label: '查看审核', module: '审核中心' },
    { key: 'review:approve', label: '通过审核', module: '审核中心' },
    { key: 'review:reject', label: '驳回审核', module: '审核中心' },
    { key: 'user:manage', label: '用户管理', module: '系统管理' },
    { key: 'dept:manage', label: '部门管理', module: '系统管理' },
  ],
  /** 角色默认权限映射 */
  rolePermissions: {
    SYSTEM_ADMIN: [
      'file:view',
      'file:upload',
      'file:delete',
      'file:submit',
      'review:view',
      'review:approve',
      'review:reject',
      'user:manage',
      'dept:manage',
    ],
    REVIEWER: ['file:view', 'file:submit', 'review:view', 'review:approve', 'review:reject'],
    UPLOADER: ['file:view', 'file:upload', 'file:submit', 'review:view'],
  },
} as const;
