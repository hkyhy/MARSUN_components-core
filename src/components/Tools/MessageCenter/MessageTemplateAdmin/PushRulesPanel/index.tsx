import { FormInfo, FormModal, Input, InputNumber, Select } from '@/components/FormInfo';
import { Alert } from '@/components/Alert';
import { Empty } from '@/components/Empty';
import { PageSpin } from '@/components/Layout';
import { Table } from '@/components/Table';
import { Button, Select as AntSelect, Space, Switch, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  MessageAudienceRoleOption,
  MessageEventCatalogItem,
  MessageTemplateAdminItem,
  PushRuleAdminItem,
} from '../types';
import { resolveTemplateCodeAfterEventChange } from '../../utils/adminGuards';
import styles from '../style.module.scss';

/** CI tsc：kne Select 重载与 FieldProps 交叉时误匹配 FormItem children；宽化为任意 props */
const FiSelect = Select as unknown as React.ComponentType<Record<string, unknown>>;
const FiInput = Input as unknown as React.ComponentType<Record<string, unknown>>;
const FiInputNumber = InputNumber as unknown as React.ComponentType<Record<string, unknown>>;

export type PushRulesPanelProps = {
  canWrite: boolean;
  catalog: MessageEventCatalogItem[];
  templates: MessageTemplateAdminItem[];
  roleOptions: MessageAudienceRoleOption[];
  fetchPushRules: () => Promise<PushRuleAdminItem[]>;
  savePushRule: (item: PushRuleAdminItem) => Promise<void>;
  setPushRuleEnabled?: (item: PushRuleAdminItem, enabled: boolean) => Promise<void>;
  deletePushRule?: (item: PushRuleAdminItem) => Promise<void>;
  createNonce?: number;
};

type FormShape = {
  label?: string;
  eventKey?: string;
  templateCode?: string;
  levels?: string[];
  audienceRoles?: string[];
  slaHours?: number;
  scanLookbackDays?: number;
};

/**
 * 推送规则 CRUD：必含 eventKey + templateCode；channels 默认 in_app。
 */
export const PushRulesPanel: React.FC<PushRulesPanelProps> = ({
  canWrite,
  catalog,
  templates,
  roleOptions,
  fetchPushRules,
  savePushRule,
  setPushRuleEnabled,
  deletePushRule,
  createNonce = 0,
}) => {
  const [rows, setRows] = useState<PushRuleAdminItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<PushRuleAdminItem | null>(null);
  const [isCreate, setIsCreate] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchPushRules();
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [fetchPushRules]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!createNonce || !canWrite) return;
    const first = catalog[0];
    const tplForEvent = templates.find((t) => t.eventKey === first?.eventKey);
    setIsCreate(true);
    setEditing({
      label: first?.label || '新建推送规则',
      eventKey: first?.eventKey || '',
      templateCode: tplForEvent?.code || '',
      levels: ['L2'],
      audienceRoles: [],
      channels: ['in_app'],
      slaHours: 36,
      scanLookbackDays: 7,
      enabled: true,
    });
  }, [createNonce, canWrite, catalog, templates]);

  const templatesForEvent = useCallback(
    (eventKey?: string) =>
      templates
        .filter((t) => !eventKey || t.eventKey === eventKey)
        .map((t) => ({
          value: String(t.code || ''),
          label: `${t.label || t.code || ''}（${t.code || ''}）`,
        }))
        .filter((o) => o.value),
    [templates],
  );

  const formData = useMemo(
    () => ({
      label: editing?.label,
      eventKey: editing?.eventKey,
      templateCode: editing?.templateCode,
      levels: editing?.levels || [],
      audienceRoles: editing?.audienceRoles || [],
      slaHours: editing?.slaHours ?? 0,
      scanLookbackDays: editing?.scanLookbackDays ?? 0,
    }),
    [editing],
  );

  const formProps = useMemo(
    () => ({
      data: formData,
      onSubmit: async (data: FormShape) => {
        if (!canWrite || !editing) {
          message.warning('当前为只读');
          return false;
        }
        const eventKey = String(editing.eventKey || data.eventKey || '').trim();
        const templateCode = String(data.templateCode || '').trim();
        if (!eventKey) {
          message.warning('请选择事件');
          return false;
        }
        if (!templateCode) {
          message.warning('请关联模板编号');
          return false;
        }
        try {
          await savePushRule({
            ...editing,
            label: String(data.label || editing.label || '').trim() || eventKey,
            eventKey,
            templateCode,
            levels: data.levels || [],
            audienceRoles: data.audienceRoles || [],
            channels: ['in_app'],
            slaHours: Number(data.slaHours ?? 0),
            scanLookbackDays: Number(data.scanLookbackDays ?? 0),
            enabled: isCreate ? true : editing.enabled !== false,
          });
          message.success('已保存');
          setEditing(null);
          await reload();
        } catch (e) {
          message.error(e instanceof Error ? e.message : String(e));
          return false;
        }
      },
    }),
    [canWrite, editing, formData, isCreate, reload, savePushRule],
  );

  const columns = useMemo(
    () => [
      { title: '名称', dataIndex: 'label', key: 'label', ellipsis: true },
      {
        title: '事件',
        dataIndex: 'eventKey',
        key: 'eventKey',
        render: (v: string) => catalog.find((c) => c.eventKey === v)?.label || v || '—',
      },
      { title: '关联模板', dataIndex: 'templateCode', key: 'templateCode', width: 140 },
      {
        title: '级别',
        dataIndex: 'levels',
        key: 'levels',
        width: 100,
        render: (lv: string[] | undefined) => (lv || []).join(',') || '—',
      },
      {
        title: '启用',
        dataIndex: 'enabled',
        key: 'enabled',
        width: 80,
        render: (_: unknown, r: PushRuleAdminItem) => (
          <Switch
            size="small"
            checked={r.enabled !== false}
            disabled={!canWrite || !setPushRuleEnabled}
            onChange={(checked) => {
              void (async () => {
                try {
                  await setPushRuleEnabled?.(r, checked);
                  message.success(checked ? '已启用' : '已停用');
                  await reload();
                } catch (e) {
                  message.error(e instanceof Error ? e.message : String(e));
                }
              })();
            }}
          />
        ),
      },
      {
        title: '操作',
        key: 'actions',
        width: 140,
        render: (_: unknown, r: PushRuleAdminItem) => (
          <Space size={4}>
            <Button
              type="link"
              size="small"
              disabled={!canWrite}
              onClick={() => {
                setIsCreate(false);
                setEditing({ ...r });
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              danger
              disabled={!canWrite || !deletePushRule}
              onClick={() => {
                void (async () => {
                  try {
                    await deletePushRule?.(r);
                    message.success('已删除');
                    await reload();
                  } catch (e) {
                    message.error(e instanceof Error ? e.message : String(e));
                  }
                })();
              }}
            >
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [canWrite, catalog, deletePushRule, reload, setPushRuleEnabled],
  );

  return (
    <div className={styles.pane}>
      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} /> : null}
      <PageSpin spinning={loading}>
        {rows.length === 0 && !loading ? (
          <Empty description="暂无推送规则" />
        ) : (
          <Table<PushRuleAdminItem>
            rowKey={(r) => r.id || r.code || `${r.eventKey}-${r.templateCode}`}
            tableName="msg-center-push-rules"
            columnConfigEnabled={false}
            columnResizeEnabled={false}
            columns={columns}
            dataSource={rows}
            pagination={false}
            size="small"
          />
        )}
      </PageSpin>
      <FormModal
        title={isCreate ? '新建推送规则' : '编辑推送规则'}
        open={Boolean(editing)}
        onCancel={() => setEditing(null)}
        width={560}
        okText="保存"
        autoClose={false}
        formProps={formProps}
      >
        {/* 事件用 antd Select：FormInfo Select + onChange 在 CI tsc 下与 kne 重载冲突 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>事件</div>
          <AntSelect
            style={{ width: '100%' }}
            disabled={!canWrite}
            value={editing?.eventKey || undefined}
            options={catalog.map((c) => ({
              value: c.eventKey,
              label: c.label || c.eventKey,
            }))}
            onChange={(ek) => {
              const next = String(ek || '');
              const opts = templatesForEvent(next);
              setEditing((prev) =>
                prev
                  ? {
                      ...prev,
                      eventKey: next,
                      templateCode: resolveTemplateCodeAfterEventChange(prev.templateCode, opts),
                      label: catalog.find((c) => c.eventKey === next)?.label || prev.label,
                    }
                  : prev,
              );
            }}
            showSearch
            optionFilterProp="label"
          />
        </div>
        <FormInfo
          column={1}
          list={[
            <FiInput key="label" name="label" label="名称" rule="REQ" disabled={!canWrite} />,
            <FiSelect
              key={`tpl-${editing?.eventKey || ''}`}
              name="templateCode"
              label="关联模板"
              rule="REQ"
              disabled={!canWrite}
              options={templatesForEvent(editing?.eventKey)}
              showSearch
              optionFilterProp="label"
            />,
            <FiSelect
              key="levels"
              name="levels"
              label="级别"
              mode="multiple"
              disabled={!canWrite}
              options={['L1', 'L2', 'L3'].map((x) => ({ value: x, label: x }))}
            />,
            <FiSelect
              key="audienceRoles"
              name="audienceRoles"
              label="受众角色"
              mode="multiple"
              disabled={!canWrite}
              options={roleOptions.map((r) => ({ value: r.code, label: r.name || r.code }))}
              optionFilterProp="label"
            />,
            <FiInputNumber
              key="slaHours"
              name="slaHours"
              label="SLA(小时)"
              disabled={!canWrite}
              min={0}
              style={{ width: '100%' }}
            />,
            <FiInputNumber
              key="scanLookbackDays"
              name="scanLookbackDays"
              label="回看(天)"
              disabled={!canWrite}
              min={0}
              style={{ width: '100%' }}
            />,
          ]}
        />
      </FormModal>
    </div>
  );
};

export default PushRulesPanel;
