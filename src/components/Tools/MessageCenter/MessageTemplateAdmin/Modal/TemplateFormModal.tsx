import { FormInfo, FormItem, FormModal, Input, Select } from '@/components/FormInfo';
import {
  applyTemplateVars,
  normalizeTemplatePlaceholders,
  stripHtmlToText,
} from '../../utils/templateCode';
import { Button, Select as AntSelect, Typography, message } from 'antd';
import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import type {
  MessageAudienceRoleOption,
  MessageEventCatalogItem,
  MessageTemplateAdminItem,
  MessageTemplateVariable,
} from '../types';
import styles from '../style.module.scss';

const RichTextEditor = lazy(() =>
  import('@/components/Editor').then((m) => ({ default: m.RichTextEditor })),
);

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
};

type FormApiLike = {
  formData?: FormShape;
  getFormData?: () => FormShape;
};

/**
 * 模板新建/编辑：FormModal + FormInfo；正文 RichText 经 Editor 懒加载（L2 /editor）。
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
  const [bodyHtml, setBodyHtml] = useState('');
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !initial) return;
    setBodyHtml(normalizeTemplatePlaceholders(initial.bodyTemplate || ''));
    setRoles(initial.audienceRoles || initial.roles || []);
  }, [open, initial]);

  const formData = useMemo<FormShape>(() => {
    if (!initial) return {};
    return {
      code: initial.code,
      eventKey: initial.eventKey,
      scenario: initial.scenario || initial.label || '',
      titleTemplate: normalizeTemplatePlaceholders(
        initial.titleTemplate || initial.titlePreview || '',
      ),
    };
  }, [initial]);

  const varsEmptyHint = catalogError
    ? `目录加载失败，无法插入变量（${catalogError}）`
    : variables.length === 0
      ? '暂无 catalog 变量'
      : '';

  const fieldList = useMemo(() => {
    const fields = [];
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
        placeholder="输入 / 插入变量"
        labelTips={
          isCreate
            ? '新建默认停用；保存后可在列表中开启「启用」。输入 / 从 catalog 插入 {key}。'
            : '输入 / 从 catalog 插入变量 {key}。'
        }
      />,
    );
    return fields;
  }, [isCreate, canWrite, catalog, variables]);

  return (
    <FormModal
      title={isCreate ? '新建模板' : '编辑模板'}
      open={open}
      onCancel={onCancel}
      width={720}
      okText="保存"
      autoClose={false}
      formProps={{
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
              bodyTemplate: normalizeTemplatePlaceholders(bodyHtml),
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
      }}
    >
      <FormInfo column={1} list={fieldList} />
      <FormItem>
        {(api: FormApiLike) => (
          <Typography.Paragraph type="secondary" className={styles.preview}>
            预览：
            {applyTemplateVars(
              String(
                (typeof api.getFormData === 'function'
                  ? api.getFormData()?.titleTemplate
                  : undefined) ??
                  api.formData?.titleTemplate ??
                  formData.titleTemplate ??
                  '',
              ),
              previewVars,
            ) || '—'}
          </Typography.Paragraph>
        )}
      </FormItem>
      <div className={styles.varBar}>
        {varsEmptyHint ? <Typography.Text type="secondary">{varsEmptyHint}</Typography.Text> : null}
        <Suspense fallback={<Button loading disabled type="text" />}>
          <RichTextEditor
            value={bodyHtml}
            disabled={!canWrite}
            enableVariableMention
            variables={variables}
            placeholder="编辑正文，输入 / 插入变量"
            onChange={setBodyHtml}
          />
        </Suspense>
        <Typography.Paragraph type="secondary" className={styles.preview}>
          预览：{applyTemplateVars(stripHtmlToText(bodyHtml), previewVars) || '—'}
        </Typography.Paragraph>
      </div>
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
