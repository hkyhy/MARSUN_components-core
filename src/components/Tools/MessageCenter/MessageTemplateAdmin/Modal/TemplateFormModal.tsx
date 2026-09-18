import { FormInfo, FormItem, FormModal, Input, Select } from '@/components/FormInfo';
import { RichTextField } from '@/components/FormInfo/RichTextField';
import { sanitizeInboxHtml } from '@/components/Tools/Inbox/sanitizeInboxHtml';
import { applyTemplateVars, normalizeTemplatePlaceholders } from '../../utils/templateCode';
import { Collapse, Modal, Typography, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  MessageAudienceRoleOption,
  MessageEventCatalogItem,
  MessageTemplateAdminItem,
  MessageTemplateVariable,
} from '../types';
import {
  AUDIENCE_SLOT_OPTIONS,
  ORG_TENANT_SLOT,
  hasAudienceSelection,
  normalizeAudienceSlots,
} from '../audienceSlots';
import styles from '../style.module.scss';

/** ReactModal 内 Select 弹出层须高于 Modal（≈1100） */
const selectInModalPopupProps = {
  getPopupContainer: () => document.body,
  styles: { popup: { root: { zIndex: 2000 } } },
} as const;

export type TemplateFormModalProps = {
  open: boolean;
  isCreate: boolean;
  initial: MessageTemplateAdminItem | null;
  catalog: MessageEventCatalogItem[];
  roleOptions: MessageAudienceRoleOption[];
  variables: MessageTemplateVariable[];
  /** catalog 请求失败时的短文案（与「变量为空」区分） */
  catalogError?: string;
  previewVars: Record<string, string>;
  canWrite: boolean;
  onCancel: () => void;
  onSubmit: (item: MessageTemplateAdminItem) => Promise<void>;
  renderAudienceField?: (ctx: {
    roles: string[];
    onChange: (roles: string[]) => void;
  }) => React.ReactNode;
};

type FormShape = {
  code?: string;
  eventKey?: string;
  scenario?: string;
  titleTemplate?: string;
  bodyTemplate?: string;
  audienceRoles?: string[];
  audienceSlots?: string[];
};

type FormApiLike = {
  formData?: FormShape;
  getFormData?: () => FormShape;
};

/**
 * 模板新建/编辑：FormModal + FormInfo；正文 RichTextField。
 * CKEditor 在 open 后微任务挂载，避免与 Modal focus/动画互抢；禁 mention uplift 死循环。
 */
export const TemplateFormModal: React.FC<TemplateFormModalProps> = ({
  open,
  isCreate,
  initial,
  catalog,
  roleOptions,
  variables,
  catalogError,
  previewVars,
  canWrite,
  onCancel,
  onSubmit,
  renderAudienceField,
}) => {
  /** 仅业务 DI 自定义受众插槽时使用；默认走 FormInfo Select */
  const [roles, setRoles] = useState<string[]>([]);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    if (!open || !initial) {
      setEditorReady(false);
      return;
    }
    setRoles(initial.audienceRoles || initial.roles || []);
    const id = window.requestAnimationFrame(() => setEditorReady(true));
    return () => window.cancelAnimationFrame(id);
  }, [open, initial]);

  const editorKey = initial?.id || initial?.code || (isCreate ? 'create' : 'edit');

  const formData = useMemo<FormShape>(() => {
    if (!initial) return {};
    return {
      code: initial.code,
      eventKey: initial.eventKey,
      scenario: initial.scenario || initial.label || '',
      titleTemplate: normalizeTemplatePlaceholders(
        initial.titleTemplate || initial.titlePreview || '',
      ),
      bodyTemplate: normalizeTemplatePlaceholders(initial.bodyTemplate || ''),
      audienceRoles: initial.audienceRoles || initial.roles || [],
      audienceSlots: initial.audienceSlots || [],
    };
  }, [initial]);

  const varsEmptyHint = catalogError
    ? `目录加载失败，无法插入变量（${catalogError}）`
    : variables.length === 0
      ? '暂无 catalog 变量'
      : '';

  const handleAfterOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen) setEditorReady(true);
    else setEditorReady(false);
  }, []);

  const fieldList = useMemo(() => {
    if (!editorReady) {
      return [
        <Typography.Text key="loading" type="secondary">
          加载编辑器…
        </Typography.Text>,
      ];
    }
    const fields: React.ReactNode[] = [];
    if (!isCreate) {
      fields.push(<Input key="code" name="code" label="编号" disabled />);
    }
    fields.push(
      <Select
        key="eventKey"
        name="eventKey"
        label="适用场景"
        rule="REQ"
        disabled={!canWrite}
        optionLabelProp="label"
        options={catalog.map((c) => ({
          value: c.eventKey,
          label: c.label || c.eventKey,
        }))}
        placeholder={catalog.length ? '选择场景' : '暂无事件目录'}
        {...selectInModalPopupProps}
      />,
      <Input
        key="titleTemplate"
        name="titleTemplate"
        label="标题模板"
        rule="REQ"
        disabled={!canWrite}
        enableVariableMention
        variables={variables}
        catalogError={catalogError}
        placeholder="点「插入变量」选择 catalog 变量"
        labelTips={
          isCreate
            ? '新建默认停用。标题：点「插入变量」插入明文 {{key}}（可手改）。正文：原子色块，不可改字，整颗删除。'
            : '标题可手改 {{key}}；正文为原子色块（不可改字、Backspace 整颗删）。'
        }
      />,
      <RichTextField
        key="bodyTemplate"
        name="bodyTemplate"
        label="正文模板"
        disabled={!canWrite}
        enableVariableMention
        variables={variables}
        catalogError={catalogError}
        editorKey={editorKey}
        placeholder="编辑正文，点「插入变量」"
        minHeight={160}
      />,
    );
    if (!renderAudienceField) {
      fields.push(
        <Select
          key="audienceRoles"
          name="audienceRoles"
          label="受众角色"
          mode="multiple"
          allowClear
          disabled={!canWrite}
          options={roleOptions.map((r) => ({
            value: r.code,
            label: r.name || r.code,
          }))}
          optionFilterProp="label"
          maxTagCount="responsive"
          placeholder={roleOptions.length ? '下拉选择角色（可多选）' : '暂无角色数据'}
          notFoundContent="暂无角色"
          labelTips="可与「通知范围」并存；至少选角色或槽位之一。emit 与显式 userIds 并集送达。"
          {...selectInModalPopupProps}
        />,
        <Select
          key="audienceSlots"
          name="audienceSlots"
          label="通知范围"
          mode="multiple"
          allowClear
          disabled={!canWrite}
          options={AUDIENCE_SLOT_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
          optionFilterProp="label"
          maxTagCount="responsive"
          placeholder="可选：本人/领导/部门/分厂/租户或任务当事人"
          notFoundContent="暂无槽位"
          labelTips="依赖业务 emit.audienceContext；无上下文的槽不会发出。选「本租户」保存前会确认。"
          {...selectInModalPopupProps}
        />,
      );
    }
    return fields;
  }, [
    editorReady,
    isCreate,
    canWrite,
    catalog,
    variables,
    editorKey,
    catalogError,
    renderAudienceField,
    roleOptions,
  ]);

  const formProps = useMemo(
    () => ({
      data: formData,
      onSubmit: async (data: FormShape) => {
        if (!canWrite) {
          message.warning('当前为只读（业务未授予写权限）');
          return false;
        }
        const eventKey = String(data.eventKey || '').trim();
        if (!eventKey) {
          message.warning('请选择适用场景');
          return false;
        }
        const titleTemplate = normalizeTemplatePlaceholders(String(data.titleTemplate || ''));
        if (!titleTemplate.trim()) {
          message.warning('请填写标题模板');
          return false;
        }
        const audienceRoles = renderAudienceField
          ? roles
          : Array.isArray(data.audienceRoles)
            ? data.audienceRoles
            : [];
        const audienceSlots = normalizeAudienceSlots(data.audienceSlots || []);
        if (
          !hasAudienceSelection({
            roles: audienceRoles,
            slots: audienceSlots,
            userIds: null,
          })
        ) {
          message.warning('请选择受众角色或通知范围（至少一个）');
          return false;
        }
        if (audienceSlots.includes(ORG_TENANT_SLOT)) {
          const ok = await new Promise<boolean>((resolve) => {
            Modal.confirm({
              title: '确认通知本租户全员？',
              content: '已选「本租户（全公司）」：将向当前租户内用户展开（≠跨租户）。确认保存？',
              okText: '确认保存',
              cancelText: '取消',
              onOk: () => resolve(true),
              onCancel: () => resolve(false),
            });
          });
          if (!ok) return false;
        }
        const hit = catalog.find((c) => c.eventKey === eventKey);
        const scenario = String(hit?.label || data.scenario || eventKey).trim();
        try {
          await onSubmit({
            ...(initial || {}),
            code: data.code || initial?.code,
            eventKey,
            scenario,
            label: scenario,
            messageType: hit?.messageType || initial?.messageType || 'alert',
            titleTemplate,
            bodyTemplate: normalizeTemplatePlaceholders(String(data.bodyTemplate || '')),
            audienceRoles,
            roles: audienceRoles,
            audienceSlots,
            enabled: isCreate ? false : initial?.enabled !== false,
            channel: initial?.channel || 'in_app',
          });
          onCancel();
        } catch (e) {
          message.error(e instanceof Error ? e.message : String(e));
          return false;
        }
      },
    }),
    [
      formData,
      canWrite,
      catalog,
      onSubmit,
      initial,
      roles,
      isCreate,
      onCancel,
      renderAudienceField,
    ],
  );

  return (
    <FormModal
      title={isCreate ? '新建模板' : '编辑模板'}
      open={open}
      onCancel={onCancel}
      width={720}
      size="small"
      className="msg-center-form-modal"
      okText="保存"
      autoClose={false}
      focusable={{ trap: false }}
      afterOpenChange={handleAfterOpenChange}
      formProps={formProps}
    >
      <FormInfo column={1} list={fieldList} />
      {renderAudienceField ? (
        <div className={styles.audienceBlock}>
          <Typography.Text className={styles.audienceLabel}>
            <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>
            受众角色
          </Typography.Text>
          {renderAudienceField({ roles, onChange: setRoles })}
        </div>
      ) : null}
      {editorReady ? (
        <FormItem>
          {(api: FormApiLike) => {
            const data =
              (typeof api.getFormData === 'function' ? api.getFormData() : undefined) ??
              api.formData ??
              formData;
            const titlePreview = applyTemplateVars(String(data.titleTemplate || ''), previewVars);
            const bodyRaw = applyTemplateVars(String(data.bodyTemplate || ''), previewVars);
            const bodyHtml = sanitizeInboxHtml(bodyRaw);
            return (
              <div className={styles.previewCollapse}>
                {varsEmptyHint ? (
                  <Typography.Text type="secondary">{varsEmptyHint}</Typography.Text>
                ) : null}
                <Collapse
                  ghost
                  size="small"
                  items={[
                    {
                      key: 'preview',
                      label: '效果预览',
                      children: (
                        <div className={styles.previewCard}>
                          <div className={styles.previewTitle}>
                            {titlePreview.trim() || (
                              <span className={styles.previewEmpty}>（无标题）</span>
                            )}
                          </div>
                          {bodyHtml ? (
                            <div
                              className={styles.previewBody}
                              dangerouslySetInnerHTML={{ __html: bodyHtml }}
                            />
                          ) : (
                            <div className={`${styles.previewBody} ${styles.previewEmpty}`}>
                              （无正文）
                            </div>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            );
          }}
        </FormItem>
      ) : null}
    </FormModal>
  );
};

export default TemplateFormModal;
