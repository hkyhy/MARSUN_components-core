import { FormInfo, FormModal, Input, InputNumber, Select } from '@/components/FormInfo';
import { Alert } from '@/components/Alert';
import { Empty } from '@/components/Empty';
import { PageSpin } from '@/components/Layout';
import { Table } from '@/components/Table';
import { Button, Space, Switch, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  MessageAudienceRoleOption,
  MessageAudienceUserOption,
  MessageCrudFlags,
  MessageEventCatalogItem,
  MessageTemplateAdminItem,
  PushRuleAdminItem,
} from '../types';
import { resolveTemplateCodeAfterEventChange } from '../../utils/adminGuards';
import { buildAudienceUserSelectGroups } from '../../utils/audienceUserSelectOptions';
import styles from '../style.module.scss';

/** CI tsc：kne Select 重载与 FieldProps 交叉时误匹配 FormItem children；宽化为任意 props */
const FiSelect = Select as unknown as React.ComponentType<Record<string, unknown>>;
const FiInput = Input as unknown as React.ComponentType<Record<string, unknown>>;
const FiInputNumber = InputNumber as unknown as React.ComponentType<Record<string, unknown>>;

/** ReactModal zIndex≈1100；Select 默认 1050 会钻到 footer 后面。挂 body + 抬高弹出层 */
const selectInModalPopupProps = {
  getPopupContainer: () => document.body,
  styles: { popup: { root: { zIndex: 2000 } } },
} as const;

export type PushRulesPanelProps = {
  crud: MessageCrudFlags;
  catalog: MessageEventCatalogItem[];
  templates: MessageTemplateAdminItem[];
  roleOptions: MessageAudienceRoleOption[];
  userOptions?: MessageAudienceUserOption[];
  /** 角色 options 加载失败短文案（勿静默空列表） */
  audienceRolesError?: string;
  /** 例外抄送（静态 userIds）options 加载失败短文案 */
  audienceUsersError?: string;
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
  audienceUserIds?: string[];
  slaHours?: number;
  scanLookbackDays?: number;
};

/**
 * 推送规则 CRUD：必含 eventKey + templateCode；channels 默认 in_app。
 * 受众：角色多选（主路径）+ 例外抄送静态人（禁 Tree 盖壳）；roles∪userIds 至少一个。
 * 任务认领人/分配人等当事人由业务 emit 传 userIds，勿在配置面点名。
 */
export const PushRulesPanel: React.FC<PushRulesPanelProps> = ({
  crud,
  catalog,
  templates,
  roleOptions,
  userOptions = [],
  audienceRolesError = '',
  audienceUsersError = '',
  fetchPushRules,
  savePushRule,
  setPushRuleEnabled,
  deletePushRule,
  createNonce = 0,
}) => {
  const canCreate = crud.create;
  const canUpdate = crud.update;
  const canDelete = crud.delete;
  const canRead = crud.read;
  const formWritable = (creating: boolean) => (creating ? canCreate : canUpdate);

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
    if (!createNonce || !canCreate) return;
    const first = catalog[0];
    const tplForEvent = templates.find((t) => t.eventKey === first?.eventKey);
    setIsCreate(true);
    setEditing({
      label: first?.label || '新建推送规则',
      eventKey: first?.eventKey || '',
      templateCode: tplForEvent?.code || '',
      levels: ['L2'],
      audienceRoles: [],
      audienceUserIds: [],
      channels: ['in_app'],
      slaHours: 36,
      scanLookbackDays: 7,
      enabled: true,
    });
  }, [createNonce, canCreate, catalog, templates]);

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

  const tplOptions = useMemo(
    () => templatesForEvent(editing?.eventKey),
    [templatesForEvent, editing?.eventKey],
  );
  const scenarioLabel = useMemo(() => {
    const ek = editing?.eventKey;
    return catalog.find((c) => c.eventKey === ek)?.label || ek || '当前场景';
  }, [catalog, editing?.eventKey]);
  const noTplForEvent = Boolean(editing) && tplOptions.length === 0;

  const audienceUserSelectGroups = useMemo(
    () => buildAudienceUserSelectGroups(userOptions),
    [userOptions],
  );

  const formData = useMemo(
    () => ({
      label: editing?.label,
      eventKey: editing?.eventKey,
      templateCode: editing?.templateCode,
      levels: editing?.levels || [],
      audienceRoles: editing?.audienceRoles || [],
      audienceUserIds: editing?.audienceUserIds || [],
      slaHours: editing?.slaHours ?? 0,
      scanLookbackDays: editing?.scanLookbackDays ?? 0,
    }),
    [editing],
  );

  const formProps = useMemo(
    () => ({
      data: formData,
      onSubmit: async (data: FormShape) => {
        if (!formWritable(isCreate) || !editing) {
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
        if (templatesForEvent(eventKey).length === 0) {
          message.warning('该场景暂无消息模板，请先到「消息模板」新建后再关联');
          return false;
        }
        const audienceRoles = data.audienceRoles || [];
        const audienceUserIds = data.audienceUserIds || [];
        if (!audienceRoles.length && !audienceUserIds.length) {
          message.warning('请选择受众角色或例外抄送（至少一个）');
          return false;
        }
        try {
          await savePushRule({
            ...editing,
            label: String(data.label || editing.label || '').trim() || eventKey,
            eventKey,
            templateCode,
            levels: data.levels || [],
            audienceRoles,
            audienceUserIds,
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
    [canCreate, canUpdate, editing, formData, isCreate, reload, savePushRule, templatesForEvent],
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
            disabled={!canUpdate || !setPushRuleEnabled}
            onChange={(checked) => {
              void (async () => {
                try {
                  await setPushRuleEnabled?.(r, checked);
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
          <Space size="small">
            <Button
              type="link"
              size="small"
              disabled={!canUpdate}
              onClick={() => {
                setIsCreate(false);
                setEditing({
                  ...r,
                  audienceRoles: r.audienceRoles || [],
                  audienceUserIds: r.audienceUserIds || [],
                });
              }}
            >
              编辑
            </Button>
            {canDelete && deletePushRule ? (
              <Button
                type="link"
                size="small"
                danger
                onClick={() => {
                  void (async () => {
                    try {
                      await deletePushRule(r);
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
            ) : null}
          </Space>
        ),
      },
    ],
    [canUpdate, canDelete, catalog, deletePushRule, reload, setPushRuleEnabled],
  );

  return (
    <div className={styles.pane}>
      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} /> : null}
      <PageSpin spinning={loading}>
        {!canRead ? (
          <Empty description="无消息推送读取权限" />
        ) : rows.length === 0 && !loading ? (
          <Empty description="暂无推送规则" />
        ) : (
          <Table<PushRuleAdminItem>
            rowKey={(r) => r.id || r.code || String(r.eventKey)}
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
        size="small"
        className="msg-center-form-modal"
        okText="保存"
        okButtonProps={{ disabled: noTplForEvent || !formWritable(isCreate) }}
        autoClose={false}
        formProps={formProps}
      >
        {noTplForEvent ? (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message={`「${scenarioLabel}」暂无消息模板`}
            description="请先到「消息模板」Tab 为该场景新建模板，再回来关联。当前无法保存推送规则。"
          />
        ) : null}
        {audienceRolesError ? (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message={`受众角色加载失败：${audienceRolesError}`}
          />
        ) : null}
        {audienceUsersError ? (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message={`例外抄送人员加载失败：${audienceUsersError}`}
          />
        ) : null}
        <FormInfo
          column={1}
          list={[
            <FiSelect
              key="eventKey"
              name="eventKey"
              label="适用场景"
              rule="REQ"
              disabled={!formWritable(isCreate)}
              options={catalog.map((c) => ({
                value: c.eventKey,
                label: c.label || c.eventKey,
              }))}
              optionFilterProp="label"
              placeholder={catalog.length ? '点击下拉选择场景' : '暂无事件目录'}
              notFoundContent="暂无场景"
              onChange={(ek: string) => {
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
              {...selectInModalPopupProps}
            />,
            <FiInput
              key="label"
              name="label"
              label="名称"
              rule="REQ"
              disabled={!formWritable(isCreate)}
            />,
            <FiSelect
              key={`tpl-${editing?.eventKey || ''}`}
              name="templateCode"
              label="关联模板"
              rule="REQ"
              disabled={(!canUpdate && !isCreate) || noTplForEvent}
              options={tplOptions}
              optionFilterProp="label"
              placeholder={
                noTplForEvent ? '该场景暂无模板，请先新建消息模板' : '点击下拉选择本场景已有模板'
              }
              notFoundContent="该场景暂无模板"
              labelTips="选项来自「消息模板」Tab 中与当前适用场景相同的模板（按模板编号关联）。"
              {...selectInModalPopupProps}
            />,
            <FiSelect
              key="levels"
              name="levels"
              label="级别"
              mode="multiple"
              disabled={!canUpdate && !isCreate}
              options={['L1', 'L2', 'L3'].map((x) => ({ value: x, label: x }))}
              placeholder="点击下拉选择级别（可多选）"
              notFoundContent="无级别选项"
              labelTips="告警/任务级别档：L1 最高、L2 中、L3 较低。规则匹配 emit 时带 level 会对齐这些档。"
              {...selectInModalPopupProps}
            />,
            <FiSelect
              key="audienceRoles"
              name="audienceRoles"
              label="受众角色"
              mode="multiple"
              disabled={!formWritable(isCreate)}
              options={roleOptions.map((r) => ({ value: r.code, label: r.name || r.code }))}
              optionFilterProp="label"
              placeholder={
                audienceRolesError
                  ? '角色加载失败'
                  : roleOptions.length
                    ? '点击下拉选择角色（可多选）'
                    : '暂无角色（请确认本系统已配置角色）'
              }
              notFoundContent={
                audienceRolesError ? `加载失败：${audienceRolesError}` : '暂无角色数据'
              }
              labelTips="主路径：本系统 SSO 角色（这类事常驻通知谁）。可与「例外抄送」二选一或同时选，至少填一类。任务认领人/分配人/领导请在业务 emit 时传 userIds，勿指望在此点名。"
              {...selectInModalPopupProps}
            />,
            <FiSelect
              key="audienceUserIds"
              name="audienceUserIds"
              label="例外抄送"
              mode="multiple"
              disabled={!formWritable(isCreate)}
              options={audienceUserSelectGroups}
              optionFilterProp="searchText"
              optionLabelProp="label"
              filterOption={(input: string, option?: { searchText?: string; label?: string }) => {
                const q = String(input || '')
                  .trim()
                  .toLowerCase();
                if (!q) return true;
                const hay = String(option?.searchText || option?.label || '').toLowerCase();
                return hay.includes(q);
              }}
              optionRender={(ori: {
                data?: { label?: string; description?: string };
                label?: React.ReactNode;
              }) => {
                const label = ori.data?.label ?? ori.label;
                const description = ori.data?.description;
                return (
                  <div style={{ lineHeight: 1.35, padding: '2px 0' }}>
                    <div>{label}</div>
                    {description ? (
                      <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{description}</div>
                    ) : null}
                  </div>
                );
              }}
              placeholder={
                audienceUsersError
                  ? '人员加载失败'
                  : userOptions.length
                    ? '按部门选择例外抄送人（可多选，日常可留空）'
                    : '暂无人员（请确认本租户有用户）'
              }
              notFoundContent={
                audienceUsersError ? `加载失败：${audienceUsersError}` : '暂无人员数据'
              }
              labelTips="非常驻名单：仅管理员例外通知等场景使用。按 SSO 主部门分组；副文案为角色·工号。任务当事人（认领人/分配人/本人及领导）须由业务 emit 传 userIds，勿在此点名。"
              {...selectInModalPopupProps}
            />,
            <FiInputNumber
              key="slaHours"
              name="slaHours"
              label="处理时限(小时)"
              disabled={!canUpdate && !isCreate}
              min={0}
              style={{ width: '100%' }}
              labelTips="期望处理完成的时限（小时），默认 36。本期仅存配置，站内信推送暂不自动计时催办。"
            />,
            <FiInputNumber
              key="scanLookbackDays"
              name="scanLookbackDays"
              label="扫描回看(天)"
              disabled={!canUpdate && !isCreate}
              min={0}
              style={{ width: '100%' }}
              labelTips="巡检/匹配规则时往回看多少天的业务数据，默认 7。本期仅存配置，由后续巡检任务消费。"
            />,
          ]}
        />
      </FormModal>
    </div>
  );
};

export default PushRulesPanel;
