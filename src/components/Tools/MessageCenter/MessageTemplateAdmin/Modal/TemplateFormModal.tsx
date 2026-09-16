import { Alert } from '@/components/Alert';
import { FormInfo, FormItem, FormModal, Input, Select } from '@/components/FormInfo';
import {
  applyTemplateVars,
  normalizeTemplatePlaceholders,
  stripHtmlToText,
} from '../../utils/templateCode';
import { Button, Select as AntSelect, Space, Tag, Typography, message } from 'antd';
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
  setField?: (name: string, value: unknown) => void;
  setFields?: (fields: Array<{ name: string; value: unknown }>) => void;
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

  const appendTitleVar = (key: string, api: FormApiLike) => {
    const token = `{${key}}`;
    const cur =
      (typeof api.getFormData === 'function' ? api.getFormData()?.titleTemplate : undefined) ??
      api.formData?.titleTemplate ??
      formData.titleTemplate ??
      '';
    const next = `${cur}${token}`;
    if (typeof api.setField === 'function') {
      api.setField('titleTemplate', next);
      return;
    }
    if (typeof api.setFields === 'function') {
      api.setFields([{ name: 'titleTemplate', value: next }]);
    }
  };

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
      <Input key="titleTemplate" name="titleTemplate" label="标题模板" disabled={!canWrite} />,
    );
    return fields;
  }, [isCreate, canWrite, catalog]);

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
          <div className={styles.varBar}>
            <Space size={[4, 4]} wrap>
              <Typography.Text type="secondary">插入变量（标题）：</Typography.Text>
              {variables.length === 0 ? (
                <Typography.Text type="secondary">暂无 catalog 变量</Typography.Text>
              ) : (
                variables.map((v) => (
                  <Tag
                    key={`t-${v.key}`}
                    style={{ cursor: canWrite ? 'pointer' : 'default' }}
                    onClick={() => canWrite && appendTitleVar(v.key, api)}
                  >
                    {v.label || v.key} <code>{`{${v.key}}`}</code>
                  </Tag>
                ))
              )}
            </Space>
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
          </div>
        )}
      </FormItem>
      <div className={styles.varBar}>
        <Space size={[4, 4]} wrap>
          <Typography.Text type="secondary">插入变量（正文）：</Typography.Text>
          {variables.map((v) => (
            <Tag
              key={`b-${v.key}`}
              style={{ cursor: canWrite ? 'pointer' : 'default' }}
              onClick={() => {
                if (!canWrite) return;
                setBodyHtml((prev) => `${prev}{${v.key}}`);
              }}
            >
              {v.label || v.key} <code>{`{${v.key}}`}</code>
            </Tag>
          ))}
        </Space>
        <Suspense fallback={<Button loading disabled type="text" />}>
          <RichTextEditor
            value={bodyHtml}
            disabled={!canWrite}
            placeholder="编辑正文，可插入变量"
            onChange={setBodyHtml}
          />
        </Suspense>
        <Typography.Paragraph type="secondary" className={styles.preview}>
          预览：{applyTemplateVars(stripHtmlToText(bodyHtml), previewVars) || '—'}
        </Typography.Paragraph>
      </div>
      <div style={{ marginTop: 12 }}>
        <Typography.Text>受众角色</Typography.Text>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
          从本系统 SSO 角色选择（展示名称，写入角色码）
        </Typography.Paragraph>
        {renderAudienceField ? (
          renderAudienceField({ roles, onChange: setRoles })
        ) : (
          <AntSelect
            mode="multiple"
            style={{ width: '100%' }}
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
      {isCreate ? (
        <Alert
          type="info"
          showIcon
          message="新建默认停用；保存后可在列表中开启「启用」。"
          style={{ marginTop: 12 }}
        />
      ) : null}
    </FormModal>
  );
};

export default TemplateFormModal;
