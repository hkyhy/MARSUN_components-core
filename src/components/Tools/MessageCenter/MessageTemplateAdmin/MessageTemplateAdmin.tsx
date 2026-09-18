import { Alert } from '@/components/Alert';
import { InteractiveBlock } from '@/components/InteractiveBlock';
import { Empty } from '@/components/Empty';
import { PageSpin } from '@/components/Layout';
import { StateBar } from '@/components/StateBar';
import { Table } from '@/components/Table';
import { message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { generateTemplateCode } from '../utils/templateCode';
import { buildTemplateColumns } from './List/columns';
import { TemplateFormModal } from './Modal/TemplateFormModal';
import { PushRulesPanel } from './PushRulesPanel';
import { VariablesPanel } from './VariablesPanel';
import type {
  MessageAudienceRoleOption,
  MessageAudienceUserOption,
  MessageEventCatalogItem,
  MessageEventCatalogPayload,
  MessageTemplateAdminItem,
  MessageTemplateAdminProps,
  MessageTemplateVariable,
} from './types';
import {
  previewVarsFromVariables,
  resolveMessageAdminPermissions,
  variablesFromCatalog,
} from './types';
import styles from './style.module.scss';

function normalizeCatalogResult(
  raw: MessageEventCatalogItem[] | MessageEventCatalogPayload | undefined,
): { events: MessageEventCatalogItem[]; variables: MessageTemplateVariable[] } {
  if (!raw) return { events: [], variables: [] };
  if (Array.isArray(raw)) return { events: raw, variables: [] };
  return {
    events: Array.isArray(raw.events) ? raw.events : [],
    variables: variablesFromCatalog(raw),
  };
}

/**
 * 消息模板配置壳。权限码 / SSO / HTTP 由业务 DI。
 * 列表：core Table；表单：FormInfo FormModal；正文：L2 Editor 懒加载。
 */
export const MessageTemplateAdmin: React.FC<MessageTemplateAdminProps> = ({
  fetchTemplates,
  saveTemplate,
  fetchEventCatalog,
  setTemplateEnabled,
  fetchAudienceRoles,
  fetchAudienceUsers,
  templateVariables,
  previewVars: previewVarsProp,
  canWrite = false,
  permissions,
  renderAudienceField,
  pushRulesSlot,
  fetchPushRules,
  savePushRule,
  setPushRuleEnabled,
  deletePushRule,
  fetchVariables,
  saveVariable,
  deleteVariable,
  emptyText = '暂无消息模板',
  className,
  codePrefix = 'MEQ',
}) => {
  const perms = useMemo(
    () => resolveMessageAdminPermissions(permissions, canWrite),
    [permissions, canWrite],
  );
  const tpl = perms.template;
  const pushPerm = perms.push;
  const varPerm = perms.variable;

  const [rows, setRows] = useState<MessageTemplateAdminItem[]>([]);
  const [catalog, setCatalog] = useState<MessageEventCatalogItem[]>([]);
  const [catalogVars, setCatalogVars] = useState<MessageTemplateVariable[]>([]);
  const [roleOptions, setRoleOptions] = useState<MessageAudienceRoleOption[]>([]);
  const [userOptions, setUserOptions] = useState<MessageAudienceUserOption[]>([]);
  const [audienceRolesError, setAudienceRolesError] = useState('');
  const [audienceUsersError, setAudienceUsersError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [catalogError, setCatalogError] = useState('');
  const [editing, setEditing] = useState<MessageTemplateAdminItem | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const [tab, setTab] = useState('template');
  const [pushCreateNonce, setPushCreateNonce] = useState(0);
  const [varCreateNonce, setVarCreateNonce] = useState(0);

  const variables = useMemo(() => {
    if (catalogVars.length) return catalogVars;
    if (templateVariables?.length) return templateVariables;
    return [];
  }, [catalogVars, templateVariables]);

  const previewVars = useMemo(
    () => previewVarsProp || previewVarsFromVariables(variables),
    [previewVarsProp, variables],
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    setCatalogError('');
    try {
      const [list, catSettled, rolesSettled, usersSettled] = await Promise.all([
        fetchTemplates(),
        fetchEventCatalog
          ? fetchEventCatalog()
              .then((raw) => ({ ok: true as const, raw }))
              .catch((e: unknown) => ({
                ok: false as const,
                error: e instanceof Error ? e.message : String(e),
              }))
          : Promise.resolve({ ok: true as const, raw: { events: [], variables: [] } }),
        fetchAudienceRoles
          ? fetchAudienceRoles()
              .then((r) => ({ ok: true as const, raw: r, error: '' }))
              .catch((e: unknown) => ({
                ok: false as const,
                raw: [] as MessageAudienceRoleOption[],
                error: e instanceof Error ? e.message : String(e),
              }))
          : Promise.resolve({
              ok: true as const,
              raw: [] as MessageAudienceRoleOption[],
              error: '',
            }),
        fetchAudienceUsers
          ? fetchAudienceUsers()
              .then((r) => ({ ok: true as const, raw: r, error: '' }))
              .catch((e: unknown) => ({
                ok: false as const,
                raw: [] as MessageAudienceUserOption[],
                error: e instanceof Error ? e.message : String(e),
              }))
          : Promise.resolve({
              ok: true as const,
              raw: [] as MessageAudienceUserOption[],
              error: '',
            }),
      ]);
      setRows(Array.isArray(list) ? list : []);
      if (catSettled.ok) {
        const normalized = normalizeCatalogResult(
          catSettled.raw as MessageEventCatalogItem[] | MessageEventCatalogPayload,
        );
        setCatalog(normalized.events);
        setCatalogVars(normalized.variables);
      } else {
        setCatalog([]);
        setCatalogVars([]);
        setCatalogError(catSettled.error);
      }
      setRoleOptions(rolesSettled.raw);
      setAudienceRolesError(rolesSettled.ok ? '' : rolesSettled.error);
      setUserOptions(usersSettled.raw);
      setAudienceUsersError(usersSettled.ok ? '' : usersSettled.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates, fetchEventCatalog, fetchAudienceRoles, fetchAudienceUsers]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const eventLabel = useCallback(
    (ek?: string) => catalog.find((c) => c.eventKey === ek)?.label || ek || '—',
    [catalog],
  );

  const openCreate = () => {
    if (!tpl.create) return;
    const first = catalog[0];
    setIsCreate(true);
    setEditing({
      code: generateTemplateCode(codePrefix),
      eventKey: first?.eventKey,
      scenario: first?.label,
      label: first?.label,
      messageType: first?.messageType || 'alert',
      titleTemplate: '',
      bodyTemplate: '',
      audienceRoles: [],
      enabled: false,
      channel: 'in_app',
    });
  };

  const openEdit = (item: MessageTemplateAdminItem) => {
    if (!tpl.update) return;
    setIsCreate(false);
    setEditing({ ...item });
  };

  const onSave = async (item: MessageTemplateAdminItem) => {
    if (!saveTemplate) {
      message.warning('未配置保存接口');
      return;
    }
    await saveTemplate(item);
    message.success('已保存');
    setEditing(null);
    await reload();
  };

  const onToggleEnabled = async (item: MessageTemplateAdminItem, enabled: boolean) => {
    if (!setTemplateEnabled) {
      message.warning('未配置启用接口');
      return;
    }
    try {
      await setTemplateEnabled(item, enabled);
      message.success(enabled ? '已启用' : '已停用');
      await reload();
    } catch (e) {
      message.error(e instanceof Error ? e.message : String(e));
    }
  };

  const columns = useMemo(
    () =>
      buildTemplateColumns({
        canUpdate: tpl.update,
        eventLabel,
        onEdit: openEdit,
        onToggleEnabled: (r, enabled) => void onToggleEnabled(r, enabled),
      }),
    [tpl.update, eventLabel],
  );

  const pushEnabled = Boolean(fetchPushRules && savePushRule);
  const varsEnabled = Boolean(fetchVariables && saveVariable);

  const pushPane = pushEnabled ? (
    <PushRulesPanel
      crud={pushPerm}
      catalog={catalog}
      templates={rows}
      roleOptions={roleOptions}
      userOptions={userOptions}
      audienceRolesError={audienceRolesError}
      audienceUsersError={audienceUsersError}
      fetchPushRules={fetchPushRules!}
      savePushRule={savePushRule!}
      setPushRuleEnabled={setPushRuleEnabled}
      deletePushRule={deletePushRule}
      createNonce={pushCreateNonce}
    />
  ) : (
    (pushRulesSlot ?? (
      <InteractiveBlock
        title="消息推送"
        info={[{ label: '说明', value: '未接线 fetchPushRules：请业务注入推送规则 API。' }]}
        description="推送规则 CRUD 须由业务 DI 提供。"
        surface="inset"
      />
    ))
  );

  const variablesPane = varsEnabled ? (
    <VariablesPanel
      crud={varPerm}
      fetchVariables={fetchVariables!}
      saveVariable={saveVariable!}
      deleteVariable={deleteVariable}
      createNonce={varCreateNonce}
    />
  ) : null;

  const templatePane = (
    <div className={styles.pane}>
      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} /> : null}
      {catalogError ? (
        <Alert
          type="warning"
          showIcon
          message={`事件目录加载失败：${catalogError}`}
          style={{ marginBottom: 12 }}
        />
      ) : null}
      <PageSpin spinning={loading}>
        {!tpl.read ? (
          <Empty description="无消息模板读取权限" />
        ) : rows.length === 0 && !loading ? (
          <Empty description={emptyText} />
        ) : (
          <Table<MessageTemplateAdminItem>
            rowKey={(r) => r.id || r.code || String(r.eventKey)}
            tableName="msg-center-message-templates"
            columnConfigEnabled={false}
            columnResizeEnabled={false}
            columns={columns}
            dataSource={rows}
            pagination={false}
            size="small"
          />
        )}
      </PageSpin>
    </div>
  );

  const templateTabInfo = useMemo(
    () => [
      {
        label: '编号',
        value: '新建时自动生成模板编号。',
      },
      {
        label: '默认停用',
        value: '新建默认停用；保存后可在列表中开启「启用」。',
      },
      {
        label: '变量',
        value:
          '点「插入变量」从 catalog 选择（中文+code）。标题为明文可手改；正文为原子色块（不可改字、整颗删）。禁止 FE 平行变量表。',
      },
      ...(!tpl.create && !tpl.update
        ? [{ label: '权限', value: '当前只读：无新建/编辑权限。' }]
        : []),
      ...(!tpl.read ? [{ label: '读取', value: '无消息模板读取权限。' }] : []),
    ],
    [tpl.create, tpl.update, tpl.read],
  );

  const primaryAction = useMemo(() => {
    if (tab === 'push' && pushEnabled) {
      return {
        variant: 'button' as const,
        buttonType: 'primary' as const,
        label: '新建推送规则',
        disabled: !pushPerm.create,
        onClick: () => setPushCreateNonce((n) => n + 1),
      };
    }
    if (tab === 'variables' && varsEnabled) {
      return {
        variant: 'button' as const,
        buttonType: 'primary' as const,
        label: '新建变量',
        disabled: !varPerm.create,
        onClick: () => setVarCreateNonce((n) => n + 1),
      };
    }
    return {
      variant: 'button' as const,
      buttonType: 'primary' as const,
      label: '新建模板',
      disabled: !tpl.create || tab !== 'template',
      onClick: () => openCreate(),
    };
  }, [
    tab,
    pushEnabled,
    varsEnabled,
    pushPerm.create,
    varPerm.create,
    tpl.create,
    catalog,
    codePrefix,
  ]);

  const stateOption = [
    {
      key: 'template',
      label: '消息模板',
      info: templateTabInfo,
      children: templatePane,
    },
    {
      key: 'push',
      label: '消息推送',
      children: pushPane,
    },
    ...(varsEnabled
      ? [
          {
            key: 'variables',
            label: '变量',
            children: variablesPane,
          },
        ]
      : []),
  ];

  return (
    <div className={className ? `${styles.root} ${className}` : styles.root}>
      <StateBar
        type="tab"
        activeKey={tab}
        onChange={(k) => setTab(String(k))}
        actions={[primaryAction]}
        stateOption={stateOption}
      />
      <TemplateFormModal
        open={Boolean(editing)}
        isCreate={isCreate}
        initial={editing}
        catalog={catalog}
        roleOptions={roleOptions}
        variables={variables}
        catalogError={catalogError}
        previewVars={previewVars}
        canWrite={isCreate ? tpl.create : tpl.update}
        onCancel={() => setEditing(null)}
        onSubmit={onSave}
        renderAudienceField={renderAudienceField}
      />
    </div>
  );
};

export default MessageTemplateAdmin;
