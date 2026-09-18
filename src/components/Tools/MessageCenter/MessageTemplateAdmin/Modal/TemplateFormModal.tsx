import { FormInfo, FormItem, FormModal, Input, Select } from '@/components/FormInfo';
import { RichTextField } from '@/components/FormInfo/RichTextField';
import { sanitizeInboxHtml } from '@/components/Tools/Inbox/sanitizeInboxHtml';
import { applyTemplateVars, normalizeTemplatePlaceholders } from '../../utils/templateCode';
import { Collapse, Typography, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  MessageAudienceRoleOption,
  MessageEventCatalogItem,
  MessageTemplateAdminItem,
  MessageTemplateVariable,
} from '../types';
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
          rule="REQ"
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
        if (!audienceRoles.length) {
          message.warning('请选择受众角色');
          return false;
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
