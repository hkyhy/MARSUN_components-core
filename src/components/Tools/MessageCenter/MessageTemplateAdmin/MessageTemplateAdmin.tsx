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
import type {
  MessageAudienceRoleOption,
  MessageEventCatalogItem,
  MessageEventCatalogPayload,
  MessageTemplateAdminItem,
  MessageTemplateAdminProps,
  MessageTemplateVariable,
} from './types';
import { previewVarsFromVariables, variablesFromCatalog } from './types';
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
 * 消息模板配置壳。权限码 / SSO 树 / HTTP 由业务 DI。
 * 列表：core Table；表单：FormInfo FormModal；正文：L2 Editor 懒加载。
 */
export const MessageTemplateAdmin: React.FC<MessageTemplateAdminProps> = ({
  fetchTemplates,
  saveTemplate,
  fetchEventCatalog,
  setTemplateEnabled,
  fetchAudienceRoles,
  templateVariables,
  previewVars: previewVarsProp,
  canWrite = false,
  renderAudienceField,
  pushRulesSlot,
  emptyText = '暂无消息模板',
  className,
  codePrefix = 'MEQ',
}) => {
  const [rows, setRows] = useState<MessageTemplateAdminItem[]>([]);
  const [catalog, setCatalog] = useState<MessageEventCatalogItem[]>([]);
  const [catalogVars, setCatalogVars] = useState<MessageTemplateVariable[]>([]);
  const [roleOptions, setRoleOptions] = useState<MessageAudienceRoleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [catalogError, setCatalogError] = useState('');
  const [editing, setEditing] = useState<MessageTemplateAdminItem | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const [tab, setTab] = useState('template');

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
      const [list, catSettled, rolesSettled] = await Promise.all([
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
              .then((r) => ({ ok: true as const, raw: r }))
              .catch(() => ({ ok: true as const, raw: [] as MessageAudienceRoleOption[] }))
          : Promise.resolve({ ok: true as const, raw: [] as MessageAudienceRoleOption[] }),
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
        setCatalogError(catSettled.error || '事件目录加载失败');
      }
      setRoleOptions(Array.isArray(rolesSettled.raw) ? rolesSettled.raw : []);
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates, fetchEventCatalog, fetchAudienceRoles]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const eventLabel = useCallback(
    (eventKey?: string) => catalog.find((c) => c.eventKey === eventKey)?.label || eventKey || '—',
    [catalog],
  );

  const openCreate = () => {
    if (!canWrite) {
      message.warning('当前为只读（业务未授予写权限）');
      return;
    }
    const first = catalog[0];
    setIsCreate(true);
    setEditing({
      code: generateTemplateCode(codePrefix),
      eventKey: first?.eventKey || '',
      scenario: first?.label || '',
      messageType: first?.messageType || 'alert',
      titleTemplate: '【预警】{factory} {machine}',
      bodyTemplate: '<p>业务日 {bizDate}：{machine}（{machineId}）</p>',
      audienceRoles: [],
      roles: [],
      enabled: false,
      channel: 'in_app',
    });
  };

  const openEdit = (row: MessageTemplateAdminItem) => {
    setIsCreate(false);
    setEditing({ ...row });
  };

  const onSave = async (item: MessageTemplateAdminItem) => {
    if (!saveTemplate) {
      message.warning('未注入 saveTemplate');
      return;
    }
    await saveTemplate(item);
    message.success('已保存');
    setEditing(null);
    await reload();
  };

  const onToggleEnabled = async (row: MessageTemplateAdminItem, enabled: boolean) => {
    if (!setTemplateEnabled) {
      message.warning('未注入 setTemplateEnabled');
      return;
    }
    try {
      await setTemplateEnabled(row, enabled);
      message.success(enabled ? '已启用' : '已停用');
      await reload();
    } catch (e) {
      message.error(e instanceof Error ? e.message : String(e));
    }
  };

  const columns = useMemo(
    () =>
      buildTemplateColumns({
        canWrite,
        eventLabel,
        onEdit: openEdit,
        onToggleEnabled: (r, enabled) => void onToggleEnabled(r, enabled),
      }),
    [canWrite, eventLabel],
  );

  const freezeSlot = pushRulesSlot ?? (
    <InteractiveBlock
      title="消息推送（冻结）"
      info={[{ label: '说明', value: '推送规则本窗仅展示；开通 CRUD 请另开任务。' }]}
      description="本 Tab 冻结：不提供推送规则增删改；模板与站内信仍可用。"
      surface="inset"
    />
  );

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
        {rows.length === 0 && !loading ? (
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
        value: '标题/正文输入 / 从 catalog 插入 {key}；禁止 FE 平行变量表。',
      },
      ...(!canWrite ? [{ label: '权限', value: '当前只读：无写权限，无法新建或保存。' }] : []),
    ],
    [canWrite],
  );

  return (
    <div className={className ? `${styles.root} ${className}` : styles.root}>
      <StateBar
        type="tab"
        activeKey={tab}
        onChange={(k) => setTab(String(k))}
        stateOption={[
          {
            key: 'template',
            label: '消息模板',
            info: templateTabInfo,
            actions: [
              {
                iconType: 'Plus',
                label: '新建模板',
                disabled: !canWrite,
                onClick: () => openCreate(),
              },
            ],
            children: templatePane,
          },
          { key: 'push', label: '消息推送（冻结）', children: freezeSlot },
        ]}
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
        canWrite={canWrite}
        onCancel={() => setEditing(null)}
        onSubmit={onSave}
        renderAudienceField={renderAudienceField}
      />
    </div>
  );
};

export default MessageTemplateAdmin;
