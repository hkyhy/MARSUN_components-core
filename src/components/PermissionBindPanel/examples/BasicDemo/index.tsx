import { PermissionBindPanel } from '@/components/PermissionBindPanel';
import type { PermissionBindCatalog, PermissionBindItem } from '@/components/PermissionBindPanel';
import { useState } from 'react';

const demoCatalog: PermissionBindCatalog = {
  systemAppCode: 'demo',
  modules: [
    {
      key: 'entry',
      label: '进入应用',
      requiresSystemEntry: false,
      categories: [
        {
          key: 'entry',
          label: '入口权',
          leaves: [{ code: 'sys:demo', label: '进入演示应用' }],
        },
      ],
    },
    {
      key: 'file',
      label: '文件管理',
      requiresSystemEntry: true,
      categories: [
        {
          key: 'browse',
          label: '浏览与上传',
          leaves: [
            { code: 'file:view', label: '查看文件' },
            { code: 'file:download', label: '下载文件' },
          ],
        },
        {
          key: 'list_ops',
          label: '列表操作',
          leaves: [{ code: 'file:delete', label: '删除文件' }],
        },
      ],
    },
  ],
};

const demoPermissions: PermissionBindItem[] = [
  { id: '1', code: 'sys:demo', name: '进入演示应用', layer: 'SYSTEM' },
  { id: '2', code: 'file:view', name: '查看文件', layer: 'BUSINESS' },
  { id: '3', code: 'file:download', name: '下载文件', layer: 'BUSINESS' },
  { id: '4', code: 'file:delete', name: '删除文件', layer: 'BUSINESS' },
];

const BasicDemo = () => {
  const [value, setValue] = useState<string[]>(['1']);

  return (
    <PermissionBindPanel
      catalog={demoCatalog}
      permissions={demoPermissions}
      value={value}
      onChange={setValue}
      systemEntryCodes={['sys:demo']}
      height={360}
    />
  );
};

export default BasicDemo;
