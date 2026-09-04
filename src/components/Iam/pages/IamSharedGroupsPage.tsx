import { ModulePageShell } from '@/components/Layout';
import { Button, Form, Input, Modal, Select, Space, Table, message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { IamClient } from '../client';
import type { IamRole, IamSharedGroup, IamUser } from '../types';

export type IamSharedGroupsPageProps = {
  client: IamClient;
  title?: string;
};

export default function IamSharedGroupsPage({
  client,
  title = '共享组',
}: IamSharedGroupsPageProps) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<IamSharedGroup[]>([]);
  const [roles, setRoles] = useState<IamRole[]>([]);
  const [users, setUsers] = useState<IamUser[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IamSharedGroup | null>(null);
  const [memberOpen, setMemberOpen] = useState(false);
  const [active, setActive] = useState<IamSharedGroup | null>(null);
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [form] = Form.useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [g, r, u] = await Promise.all([
        client.listSharedGroups(),
        client.listRoles(),
        client.listUsers({ page: 1, pageSize: 100 }),
      ]);
      setRows(g);
      setRoles(r);
      setUsers(u.pageData.filter((x) => x.isActive));
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
        children: '新增共享组',
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
    <ModulePageShell title={title} actions={headerActions} fillHeight={false}>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={[
          { title: '名称', dataIndex: 'name' },
          { title: '编码', dataIndex: 'code' },
          { title: '说明', dataIndex: 'description', render: (v: string | null) => v || '—' },
          {
            title: '角色',
            key: 'roles',
            render: (_: unknown, r: IamSharedGroup) =>
              (r.groupRoles || [])
                .map((x) => x.role?.code)
                .filter(Boolean)
                .join(', ') || '—',
          },
          {
            title: '成员数',
            key: 'mc',
            render: (_: unknown, r: IamSharedGroup) => r._count?.userGroups ?? '—',
          },
          {
            title: '操作',
            key: 'ops',
            render: (_: unknown, r: IamSharedGroup) => (
              <Space>
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    setEditing(r);
                    form.setFieldsValue({
                      name: r.name,
                      description: r.description || '',
                    });
                    setOpen(true);
                  }}
                >
                  编辑
                </Button>
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    setActive(r);
                    setMemberIds([]);
                    setMemberOpen(true);
                  }}
                >
                  成员
                </Button>
                <Button
                  type="link"
                  size="small"
                  danger
                  onClick={async () => {
                    try {
                      await client.deleteSharedGroup(r.id);
                      message.success('已删除');
                      void load();
                    } catch (e) {
                      message.error(e instanceof Error ? e.message : '删除失败（请先移除成员）');
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
        title={editing ? '编辑共享组' : '新增共享组'}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const values = await form.validateFields();
          try {
            if (editing) {
              await client.updateSharedGroup(editing.id, {
                name: values.name,
                description: values.description,
              });
            } else {
              await client.createSharedGroup({
                code: values.code,
                name: values.name,
                description: values.description,
                roleIds: values.roleIds,
              });
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
          {!editing ? (
            <Form.Item name="code" label="编码" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          ) : null}
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input.TextArea rows={2} />
          </Form.Item>
          {!editing ? (
            <Form.Item name="roleIds" label="聚合角色">
              <Select
                mode="multiple"
                options={roles.map((r) => ({ value: r.id, label: `${r.code} · ${r.name}` }))}
              />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>

      <Modal
        open={memberOpen}
        title={`成员 · ${active?.name || ''}`}
        onCancel={() => setMemberOpen(false)}
        onOk={async () => {
          if (!active || !memberIds.length) return;
          try {
            await client.addSharedGroupMembers(active.id, memberIds);
            message.success('已添加成员');
            setMemberOpen(false);
            void load();
          } catch (e) {
            message.error(e instanceof Error ? e.message : '失败');
          }
        }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <Button
              danger
              disabled={!memberIds.length || !active}
              onClick={async () => {
                if (!active) return;
                try {
                  await client.removeSharedGroupMembers(active.id, memberIds);
                  message.success('已移除成员');
                  setMemberOpen(false);
                  void load();
                } catch (e) {
                  message.error(e instanceof Error ? e.message : '失败');
                }
              }}
            >
              移除所选
            </Button>
            <CancelBtn />
            <OkBtn />
          </>
        )}
      >
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          value={memberIds}
          onChange={setMemberIds}
          options={users.map((u) => ({
            value: u.id,
            label: `${u.displayName} · ${u.employeeId}`,
          }))}
          placeholder="选择用户后可添加或移除"
        />
      </Modal>
    </ModulePageShell>
  );
}
