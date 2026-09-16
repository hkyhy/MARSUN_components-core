import { Alert } from '@/components/Alert';
import { Empty } from '@/components/Empty';
import { PageSpin } from '@/components/Layout';
import { StateBar } from '@/components/StateBar';
import { Table } from '@/components/Table';
import { Button, Space, message } from 'antd';
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
    try {
      const [list, catRaw, rolesRes] = await Promise.all([
        fetchTemplates(),
        fetchEventCatalog ? fetchEventCatalog().catch(() => []) : Promise.resolve([]),
        fetchAudienceRoles ? fetchAudienceRoles().catch(() => []) : Promise.resolve([]),
      ]);
      setRows(Array.isArray(list) ? list : []);
      const normalized = normalizeCatalogResult(
        catRaw as MessageEventCatalogItem[] | MessageEventCatalogPayload,
      );
      setCatalog(normalized.events);
      setCatalogVars(normalized.variables);
      setRoleOptions(Array.isArray(rolesRes) ? rolesRes : []);
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
      enabled: false,
      channel: 'in_app',
    });
  };

  const openEdit = (row: MessageTemplateAdminItem) => {
    if (!canWrite) {
      message.warning('当前为只读（业务未授予写权限）');
      return;
    }
    setIsCreate(false);
    setEditing({ ...row });
  };

  const onSave = async (item: MessageTemplateAdminItem) => {
    if (!saveTemplate) return;
    await saveTemplate({
      ...item,
      code: item.code || generateTemplateCode(codePrefix),
    });
    message.success('已保存');
    await reload();
  };

  const onToggleEnabled = async (row: MessageTemplateAdminItem, enabled: boolean) => {
    if (!canWrite) return;
    if (setTemplateEnabled) {
      try {
        await setTemplateEnabled(row, enabled);
        await reload();
      } catch (e) {
        message.error(e instanceof Error ? e.message : String(e));
      }
      return;
    }
    if (!saveTemplate) return;
    try {
      await saveTemplate({ ...row, enabled });
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
    <Alert
      type="info"
      showIcon
      message="消息推送（冻结）"
      description="推送规则本窗冻结，仅展示说明；开通 CRUD 请另窗。"
    />
  );

  const templatePane = (
    <div className={styles.pane}>
      <Space className={styles.toolbar} wrap>
        <Button type="primary" disabled={!canWrite} onClick={openCreate}>
          新建模板
        </Button>
        {!canWrite ? <Alert type="warning" showIcon message="只读：无写权限" /> : null}
      </Space>
      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} /> : null}
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

  return (
    <div className={className ? `${styles.root} ${className}` : styles.root}>
      <StateBar
        type="tab"
        activeKey={tab}
        onChange={(k) => setTab(String(k))}
        stateOption={[
          { key: 'template', label: '消息模板', children: templatePane },
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
