import { FormInfo, FormItem, FormModal, Input, Select } from '@/components/FormInfo';
import { RichTextField } from '@/components/FormInfo/RichTextField';
import {
  applyTemplateVars,
  normalizeTemplatePlaceholders,
  stripHtmlToText,
} from '../../utils/templateCode';
import { Select as AntSelect, Typography, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  MessageAudienceRoleOption,
  MessageEventCatalogItem,
  MessageTemplateAdminItem,
  MessageTemplateVariable,
} from '../types';
import styles from '../style.module.scss';

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
  const [roles, setRoles] = useState<string[]>([]);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    if (!open || !initial) {
      setEditorReady(false);
      return;
    }
    setRoles(initial.audienceRoles || initial.roles || []);
    // 打开后再挂编辑器（afterOpenChange 兜底 + rAF）
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
        label="事件"
        rule="REQ"
        disabled={!canWrite}
        optionLabelProp="label"
        options={catalog.map((c) => ({
          value: c.eventKey,
          label: c.label,
        }))}
      />,
      <Input key="scenario" name="scenario" label="适用场景" rule="REQ" disabled={!canWrite} />,
      <Input
        key="titleTemplate"
        name="titleTemplate"
        label="标题模板"
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
    return fields;
  }, [editorReady, isCreate, canWrite, catalog, variables, editorKey]);

  const formProps = useMemo(
    () => ({
      data: formData,
      onSubmit: async (data: FormShape) => {
        if (!canWrite) {
          message.warning('当前为只读（业务未授予写权限）');
          return false;
        }
        const scenario = String(data.scenario || '').trim();
        const eventKey = String(data.eventKey || '').trim();
        if (!scenario) {
          message.warning('请填写适用场景');
          return false;
        }
        if (!eventKey) {
          message.warning('请选择事件');
          return false;
        }
        const hit = catalog.find((c) => c.eventKey === eventKey);
        try {
          await onSubmit({
            ...(initial || {}),
            code: data.code || initial?.code,
            eventKey,
            scenario,
            label: scenario,
            messageType: hit?.messageType || initial?.messageType || 'alert',
            titleTemplate: normalizeTemplatePlaceholders(String(data.titleTemplate || '')),
            bodyTemplate: normalizeTemplatePlaceholders(String(data.bodyTemplate || '')),
            audienceRoles: roles,
            roles,
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
    [formData, canWrite, catalog, onSubmit, initial, roles, isCreate, onCancel],
  );

  return (
    <FormModal
      title={isCreate ? '新建模板' : '编辑模板'}
      open={open}
      onCancel={onCancel}
      width={720}
      okText="保存"
      autoClose={false}
      focusable={{ trap: false }}
      afterOpenChange={handleAfterOpenChange}
      formProps={formProps}
    >
      <FormInfo column={1} list={fieldList} />
      {editorReady ? (
        <FormItem>
          {(api: FormApiLike) => {
            const data =
              (typeof api.getFormData === 'function' ? api.getFormData() : undefined) ??
              api.formData ??
              formData;
            const titlePreview = applyTemplateVars(String(data.titleTemplate || ''), previewVars);
            const bodyPreview = applyTemplateVars(
              stripHtmlToText(String(data.bodyTemplate || '')),
              previewVars,
            );
            return (
              <>
                {varsEmptyHint ? (
                  <Typography.Text type="secondary">{varsEmptyHint}</Typography.Text>
                ) : null}
                <Typography.Paragraph type="secondary" className={styles.preview}>
                  标题预览：{titlePreview || '—'}
                </Typography.Paragraph>
                <Typography.Paragraph type="secondary" className={styles.preview}>
                  正文预览：{bodyPreview || '—'}
                </Typography.Paragraph>
              </>
            );
          }}
        </FormItem>
      ) : null}
      <div style={{ marginTop: 12 }}>
        <Typography.Text>受众角色</Typography.Text>
        {renderAudienceField ? (
          renderAudienceField({ roles, onChange: setRoles })
        ) : (
          <AntSelect
            mode="multiple"
            style={{ width: '100%', marginTop: 8 }}
            value={roles}
            disabled={!canWrite}
            placeholder={roleOptions.length ? '选择角色' : '暂无角色数据'}
            options={roleOptions.map((r) => ({
              value: r.code,
              label: r.name || r.code,
            }))}
            optionFilterProp="label"
            onChange={(v) => setRoles(v || [])}
            notFoundContent="暂无角色"
          />
        )}
      </div>
    </FormModal>
  );
};

export default TemplateFormModal;
