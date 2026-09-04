import { ModulePageShell } from '@/components/Layout';
import { Modal } from '@/components/Modal';
import {
  PermissionBindPanel,
  type PermissionBindCatalog,
  type PermissionBindItem,
} from '@/components/PermissionBindPanel';
import Filter, {
  getFilterValue,
  InputFilterItem as ReactInputFilterItem,
  type FilterValue,
} from '@/components/ReactFilter';
import { Table } from '@/components/Table';
import { SEMANTIC_COLORS, Tags } from '@/components/Tag';
import { CommonDescriptions, type DescriptionItem } from '@/components/Descriptions';
import { FormDataSync, FormInfo, FormModal, Select } from '@/components/Form';
import { Button, Space, Typography, message } from 'antd';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import type { IamClient } from '../client';
import type { IamRole, IamSharedGroup, IamUser } from '../types';
import { catalogToItems } from '../utils/catalogToItems';
import { buildDraftEffectivePermissions } from '../utils/draftEffectivePermissions';
import { MULTI_TAG_SHOW_LENGTH, multiTagSelectProps } from '../utils/multiTagSelect';
import { roleDisplayName, roleSelectOption } from '../utils/roleDisplay';

const ReactFilterBar = Filter as ComponentType<{
  value: FilterValue;
  onChange: (next: FilterValue) => void;
  list: unknown;
}>;

const EP_PANEL_HEIGHT = 420;

function buildViewItems(user: IamUser): DescriptionItem[] {
  const rolesValue: ReactNode = user.roles?.length ? (
    <Tags
      tags={user.roles.map((r) => roleDisplayName(r))}
      showLength={MULTI_TAG_SHOW_LENGTH}
      color={SEMANTIC_COLORS.INFO}
      empty="—"
    />
  ) : (
    '—'
  );

  return [
    { label: '工号', value: user.employeeId || '—' },
    { label: '姓名', value: user.displayName || '—' },
    { label: '邮箱', value: user.email || '—' },
    {
      label: '组织',
      value:
        user.orgs
          ?.map((o) => o.name)
          .filter(Boolean)
          .join('、') || '—',
      span: 2,
    },
    { label: '角色', value: rolesValue, span: 2 },
  ];
}

export type IamUsersPageProps = {
  client: IamClient;
  catalog: PermissionBindCatalog;
  systemEntryCodes: readonly string[];
  tableName?: string;
  title?: string;
};

export default function IamUsersPage({
  client,
  catalog,
  systemEntryCodes,
  tableName = 'iam_users',
  title = '用户管理',
}: IamUsersPageProps) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<IamUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterValue, setFilterValue] = useState<FilterValue>([]);
  const keyword = useMemo(() => {
    const flat = getFilterValue(filterValue) as Record<string, unknown>;
    return String(flat.keyword ?? '');
  }, [filterValue]);
  const [viewUser, setViewUser] = useState<IamUser | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [permUser, setPermUser] = useState<IamUser | null>(null);
  const [roles, setRoles] = useState<IamRole[]>([]);
  const [groups, setGroups] = useState<IamSharedGroup[]>([]);
  const [roleCodes, setRoleCodes] = useState<string[]>([]);
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [permFormEpoch, setPermFormEpoch] = useState(0);

  const catalogNameByCode = useMemo(() => {
    const m: Record<string, string> = {};
    for (const item of catalogToItems(catalog)) {
      m[item.code] = item.name;
    }
    return m;
  }, [catalog]);

  const draftEp = useMemo(
    () =>
      buildDraftEffectivePermissions({
        roleCodes,
        groupIds,
        roles,
        groups,
        nameByCode: catalogNameByCode,
      }),
    [roleCodes, groupIds, roles, groups, catalogNameByCode],
  );

  const panelPermissions = useMemo((): PermissionBindItem[] => {
    const epItems = draftEp
      .filter((p) => p.layer !== 'RESOURCE')
      .map((p) => ({
        id: p.code,
        code: p.code,
        name: p.name || p.code,
        layer: p.layer,
      }));
    const byCode = new Map(epItems.map((p) => [p.code, p]));
    const fromCatalog = catalogToItems(catalog).map((item) => {
      const hit = byCode.get(item.code);
      return hit ? { ...item, name: hit.name || item.name, layer: hit.layer || item.layer } : item;
    });
    const used = new Set(fromCatalog.map((p) => p.code));
    return [...fromCatalog, ...epItems.filter((p) => !used.has(p.code))];
  }, [draftEp, catalog]);

  const checkedEpIds = useMemo(
    () => draftEp.filter((p) => p.layer !== 'RESOURCE').map((p) => p.code),
    [draftEp],
  );

  const roleOptions = useMemo(() => roles.map((r) => roleSelectOption(r)), [roles]);
  const groupOptions = useMemo(
    () =>
      groups.map((g) => ({
        value: g.id,
        label: g.name || g.code,
        title: g.code ? `编码：${g.code}` : g.name,
      })),
    [groups],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await client.listUsers({ page, pageSize: 20, keyword: keyword || undefined });
      setRows(data.pageData);
      setTotal(data.total);
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [client, page, keyword]);

  useEffect(() => {
    void load();
  }, [load]);

  const openView = async (u: IamUser) => {
    setViewUser(u);
    setViewLoading(true);
    try {
      const detail = await client.getUser(u.id);
      setViewUser({
        ...u,
        ...detail,
        orgs: detail.orgs?.length ? detail.orgs : u.orgs,
        roles: detail.roles?.length ? detail.roles : u.roles,
      });
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载用户详情失败');
    } finally {
      setViewLoading(false);
    }
  };

  const openPerm = async (u: IamUser) => {
    setPermUser(u);
    try {
      const [r, g, mine, detail] = await Promise.all([
        client.listRoles(),
        client.listSharedGroups(),
        client.listUserSharedGroups(u.id),
        client.getUser(u.id),
      ]);
      setRoles(r);
      setGroups(g);
      setGroupIds(mine.map((x) => x.id));
      const appRoleCodes =
        detail.roles?.filter((x) => r.some((rr) => rr.code === x.code)).map((x) => x.code) || [];
      setRoleCodes(appRoleCodes);
      setPermFormEpoch((n) => n + 1);
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载权限失败');
    }
  };

  const onPermFormSync = useCallback((data: Record<string, unknown>) => {
    if (Array.isArray(data.groupIds)) setGroupIds(data.groupIds.map(String));
    if (Array.isArray(data.roleCodes)) setRoleCodes(data.roleCodes.map(String));
  }, []);

  const viewItems = useMemo(() => (viewUser ? buildViewItems(viewUser) : []), [viewUser]);

  return (
    <ModulePageShell title={title} fillHeight={false}>
      <div style={{ marginBottom: 12 }}>
        <ReactFilterBar
          value={filterValue}
          onChange={(next) => {
            setFilterValue(next);
            setPage(1);
          }}
          list={[
            [
              {
                type: ReactInputFilterItem,
                props: {
                  name: 'keyword',
                  label: '工号/姓名',
                  placeholder: '工号/姓名',
                },
              },
            ],
          ]}
        />
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        tableName={tableName}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: setPage,
        }}
        columns={[
          { title: '工号', dataIndex: 'employeeId' },
          { title: '姓名', dataIndex: 'displayName' },
          { title: '邮箱', dataIndex: 'email', render: (v: string | null) => v || '—' },
          {
            title: '组织',
            key: 'org',
            render: (_: unknown, r: IamUser) =>
              r.orgs?.find((o) => o.isPrimary)?.name || r.orgs?.[0]?.name || '—',
          },
          {
            title: '操作',
            key: 'ops',
            render: (_: unknown, r: IamUser) => (
              <Space>
                <Button type="link" size="small" onClick={() => void openView(r)}>
                  查看
                </Button>
                <Button type="link" size="small" onClick={() => void openPerm(r)}>
                  权限管理
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        open={Boolean(viewUser)}
        title="查看用户"
        onCancel={() => setViewUser(null)}
        footer={null}
        size="M"
        scrollable
      >
        {viewUser ? (
          <CommonDescriptions
            content={viewItems}
            column={1}
            bordered
            size="small"
            title={viewLoading ? '加载中…' : undefined}
          />
        ) : null}
      </Modal>

      <FormModal
        key={`iam-perm-${permUser?.id || 'x'}-${permFormEpoch}`}
        open={Boolean(permUser)}
        title={`权限管理 · ${permUser?.displayName || ''}`}
        width={920}
        onCancel={() => setPermUser(null)}
        okText="保存"
        cancelText="取消"
        formProps={{
          data: {
            dataScope: 'COMPANY',
            groupIds,
            roleCodes,
          },
          onSubmit: async (data: { groupIds?: string[]; roleCodes?: string[] }) => {
            if (!permUser) return;
            try {
              await client.setUserAppRoleCodes(permUser.id, data.roleCodes ?? roleCodes);
              await client.setUserSharedGroups(permUser.id, data.groupIds ?? groupIds);
              message.success('已保存');
              setPermUser(null);
              void load();
            } catch (e) {
              message.error(e instanceof Error ? e.message : '保存失败');
              throw e;
            }
          },
        }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <FormInfo
            column={2}
            gap={16}
            list={[
              <Select
                key="dataScope"
                name="dataScope"
                label="数据权限"
                disabled
                options={[{ value: 'COMPANY', label: '全公司' }]}
              />,
              <Select
                key="groupIds"
                name="groupIds"
                label="共享组"
                mode="multiple"
                allowClear
                options={groupOptions}
                placeholder="请选择共享组（可选）"
                {...multiTagSelectProps}
              />,
              <Select
                key="roleCodes"
                name="roleCodes"
                label="用户角色"
                mode="multiple"
                allowClear
                options={roleOptions}
                placeholder="请选择本应用角色（可选）"
                {...multiTagSelectProps}
              />,
            ]}
          />
          <FormDataSync onChange={onPermFormSync} />
          <div>
            <Typography.Text strong>权限点（只读预览）</Typography.Text>
            {panelPermissions.length === 0 ? (
              <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                暂无权限点
              </Typography.Text>
            ) : (
              <div style={{ marginTop: 8 }}>
                <PermissionBindPanel
                  catalog={catalog}
                  permissions={panelPermissions}
                  value={checkedEpIds}
                  onChange={() => undefined}
                  systemEntryCodes={[...systemEntryCodes]}
                  readOnly
                  height={EP_PANEL_HEIGHT}
                />
              </div>
            )}
          </div>
        </Space>
      </FormModal>
    </ModulePageShell>
  );
}
