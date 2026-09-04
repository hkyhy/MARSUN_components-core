import { ModulePageShell } from '@/components/Layout';
import { PermissionBindPanel, type PermissionBindCatalog } from '@/components/PermissionBindPanel';
import { Button, Empty, Form, Input, Modal, Space, Table, Typography, message } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { IamClient } from '../client';
import type { IamPermission, IamRole } from '../types';

/** 隐藏矩阵 sync 运维 provenance，不当作用户可读描述 */
export function displayRoleDescription(v: string | null | undefined): string {
  const t = (v || '').trim();
  if (!t) return '—';
  if (/^(Synced from .+ role matrix|S3 Wave2 pilot matrix)/i.test(t)) return '—';
  return t;
}

export type IamRolesPageProps = {
  client: IamClient;
  /** 角色列表路由，默认 `/config/iam/roles` */
  rolesListPath?: string;
  /** 绑权页路径工厂 */
  rolePermissionsPath?: (roleId: string) => string;
  title?: string;
};

export function IamRolesPage({
  client,
  rolesListPath = '/config/iam/roles',
  rolePermissionsPath,
  title = '角色管理',
}: IamRolesPageProps) {
  const navigate = useNavigate();
  const resolvePermPath =
    rolePermissionsPath ?? ((id: string) => `${rolesListPath}/${id}/permissions`);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<IamRole[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IamRole | null>(null);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await client.listRoles());
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  const headerActions = useMemo(
    () => [
      {
        children: '新增角色',
        type: 'primary' as const,
        onClick: () => {
          setEditing(null);
          form.resetFields();
          setOpen(true);
        },
      },
    ],
    [form],
  );

  return (
    <ModulePageShell title={title} actions={headerActions}>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={[
          { title: '角色名称', dataIndex: 'name' },
          { title: '编码', dataIndex: 'code' },
          {
            title: '描述',
            dataIndex: 'description',
            render: (v: string | null) => displayRoleDescription(v),
          },
          {
            title: '用户数',
            key: 'uc',
            render: (_: unknown, r: IamRole) => r._count?.userRoles ?? '—',
          },
          {
            title: '操作',
            key: 'ops',
            render: (_: unknown, r: IamRole) => (
              <Space>
                <Button type="link" size="small" onClick={() => navigate(resolvePermPath(r.id))}>
                  权限管理
                </Button>
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    setEditing(r);
                    form.setFieldsValue({
                      name: r.name,
                      description:
                        displayRoleDescription(r.description) === '—' ? '' : r.description || '',
                    });
                    setOpen(true);
                  }}
                >
                  编辑
                </Button>
                <Button
                  type="link"
                  size="small"
                  danger
                  disabled={Boolean(r.isBuiltin)}
                  onClick={async () => {
                    try {
                      await client.deleteRole(r.id);
                      message.success('已删除');
                      void load();
                    } catch (e) {
                      message.error(e instanceof Error ? e.message : '删除失败');
                    }
                  }}
                >
                  删除
                </Button>
              </Space>
            ),
          },
        ]}
      />
      <Modal
        open={open}
        title={editing ? '编辑角色' : '新增角色'}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const values = await form.validateFields();
          try {
            if (editing) {
              await client.updateRole(editing.id, values);
            } else {
              await client.createRole(values);
            }
            message.success('已保存');
            setOpen(false);
            void load();
          } catch (e) {
            message.error(e instanceof Error ? e.message : '失败');
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item name="description" label="角色描述">
            <Input.TextArea placeholder="请输入角色描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </ModulePageShell>
  );
}

export type IamRolePermissionsPageProps = {
  client: IamClient;
  catalog: PermissionBindCatalog;
  systemEntryCodes: readonly string[];
  systemAppCode: string;
  rolesListPath?: string;
  onAfterSave?: () => void | Promise<void>;
  emptyCatalogHint?: string;
  title?: string;
};

export function IamRolePermissionsPage({
  client,
  catalog,
  systemEntryCodes,
  systemAppCode,
  rolesListPath = '/config/iam/roles',
  onAfterSave,
  emptyCatalogHint = '暂无权限点；请先在 SSO 导入本应用目录。',
  title = '权限管理',
}: IamRolePermissionsPageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState<IamRole | null>(null);
  const [perms, setPerms] = useState<IamPermission[]>([]);
  const [checked, setChecked] = useState<string[]>([]);
  const checkedRef = useRef(checked);
  checkedRef.current = checked;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    void Promise.all([client.listRoles(), client.listPermissions()])
      .then(([roles, allPerms]) => {
        const r = roles.find((x) => x.id === id) || null;
        setRole(r);
        const appPerms = allPerms.filter(
          (p) => p.layer !== 'RESOURCE' && (!p.systemAppId || p.systemApp?.code === systemAppCode),
        );
        setPerms(appPerms);
        setChecked(
          (r?.rolePermissions || [])
            .map((x) => x.permissionId || x.permission?.id || '')
            .filter(Boolean),
        );
      })
      .catch((e) => message.error(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setLoading(false));
  }, [id, client, systemAppCode]);

  const panelPermissions = useMemo(
    () =>
      perms.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        layer: p.layer,
      })),
    [perms],
  );

  const onCheckedChange = useCallback((next: string[]) => {
    setChecked(next);
  }, []);

  const headerActions = useMemo(
    () => [
      {
        children: '返回',
        onClick: () => navigate(rolesListPath),
      },
      {
        children: '保存',
        type: 'primary' as const,
        loading: saving,
        onClick: async () => {
          if (!id) return;
          setSaving(true);
          try {
            await client.setRolePermissions(id, checkedRef.current.filter(Boolean));
            message.success('已保存');
            try {
              await onAfterSave?.();
            } catch {
              /* ignore EP refresh */
            }
          } catch (e) {
            message.error(e instanceof Error ? e.message : '保存失败');
          } finally {
            setSaving(false);
          }
        },
      },
    ],
    [id, navigate, saving, client, rolesListPath, onAfterSave],
  );

  return (
    <ModulePageShell title={title} actions={headerActions} spinning={loading}>
      <Typography.Paragraph style={{ marginTop: 0 }}>
        角色名称：{role?.name || '—'}
      </Typography.Paragraph>
      <Typography.Paragraph type="secondary">
        按页面模块 → 分类 → 功能点勾选（中文目录来自 bindCatalog）。须先勾选「进入应用」SYSTEM
        入口。RESOURCE 不在此绑定。
      </Typography.Paragraph>
      {perms.length === 0 && !loading ? (
        <Empty description={emptyCatalogHint} />
      ) : (
        <PermissionBindPanel
          catalog={catalog}
          permissions={panelPermissions}
          value={checked}
          onChange={onCheckedChange}
          systemEntryCodes={[...systemEntryCodes]}
        />
      )}
    </ModulePageShell>
  );
}
