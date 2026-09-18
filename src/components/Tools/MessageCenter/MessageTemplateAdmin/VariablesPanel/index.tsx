import { FormInfo, FormModal, Input, Select } from '@/components/FormInfo';
import { Alert } from '@/components/Alert';
import { Empty } from '@/components/Empty';
import { PageSpin } from '@/components/Layout';
import { Table } from '@/components/Table';
import { Button, Space, Tag, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { MessageCrudFlags, MessageTemplateVariableAdmin } from '../types';
import { canDeleteTenantVariable } from '../../utils/adminGuards';
import styles from '../style.module.scss';

/** CI tsc：kne Field 重载误匹配 FormItem children */
const FiSelect = Select as unknown as React.ComponentType<Record<string, unknown>>;
const FiInput = Input as unknown as React.ComponentType<Record<string, unknown>>;

export type VariablesPanelProps = {
  crud: MessageCrudFlags;
  fetchVariables: () => Promise<MessageTemplateVariableAdmin[]>;
  saveVariable: (item: MessageTemplateVariableAdmin) => Promise<void>;
  deleteVariable?: (item: MessageTemplateVariableAdmin) => Promise<void>;
  createNonce?: number;
};

type FormShape = { key?: string; label?: string; type?: string };

/**
 * 租户变量管理：可增改；基线 key 不可删（source=catalog 或 baseline）。
 */
export const VariablesPanel: React.FC<VariablesPanelProps> = ({
  crud,
  fetchVariables,
  saveVariable,
  deleteVariable,
  createNonce = 0,
}) => {
  const canCreate = crud.create;
  const canUpdate = crud.update;
  const canDelete = crud.delete;
  const canRead = crud.read;
  const formWritable = (creating: boolean) => (creating ? canCreate : canUpdate);

  const [rows, setRows] = useState<MessageTemplateVariableAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<MessageTemplateVariableAdmin | null>(null);
  const [isCreate, setIsCreate] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchVariables();
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [fetchVariables]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!createNonce || !canCreate) return;
    setIsCreate(true);
    setEditing({ key: '', label: '', type: 'string', source: 'tenant' });
  }, [createNonce, canCreate]);

  const formData = useMemo(
    () => ({
      key: editing?.key,
      label: editing?.label,
      type: editing?.type || 'string',
    }),
    [editing],
  );

  const formProps = useMemo(
    () => ({
      data: formData,
      onSubmit: async (data: FormShape) => {
        if (!formWritable(isCreate) || !editing) return false;
        const key = String(data.key || editing.key || '').trim();
        if (!key) {
          message.warning('请填写变量 key');
          return false;
        }
        try {
          await saveVariable({
            ...editing,
            key,
            label: String(data.label || '').trim(),
            type: String(data.type || 'string'),
            source: 'tenant',
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
    [canCreate, canUpdate, editing, formData, isCreate, reload, saveVariable],
  );

  const columns = useMemo(
    () => [
      { title: 'key', dataIndex: 'key', key: 'key', width: 140 },
      { title: '中文', dataIndex: 'label', key: 'label', ellipsis: true },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 110,
        render: (t: string | undefined) =>
          t === 'number' ? '数字（number）' : t === 'string' || !t ? '文本（string）' : t,
      },
      {
        title: '来源',
        dataIndex: 'source',
        key: 'source',
        width: 100,
        render: (_: unknown, r: MessageTemplateVariableAdmin) => (
          <Tag>{r.source === 'tenant' ? (r.baseline ? '覆盖基线' : '租户') : '基线'}</Tag>
        ),
      },
      {
        title: '操作',
        key: 'actions',
        width: 140,
        render: (_: unknown, r: MessageTemplateVariableAdmin) => (
          <Space size={4}>
            <Button
              type="link"
              size="small"
              disabled={!canUpdate}
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
              disabled={!canDelete || !deleteVariable || !canDeleteTenantVariable(r)}
              onClick={() => {
                void (async () => {
                  try {
                    await deleteVariable?.(r);
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
    [canUpdate, canDelete, deleteVariable, reload],
  );

  return (
    <div className={styles.pane}>
      {error ? <Alert type="error" showIcon message={error} style={{ marginBottom: 12 }} /> : null}
      <PageSpin spinning={loading}>
        {!canRead ? (
          <Empty description="无消息变量读取权限" />
        ) : rows.length === 0 && !loading ? (
          <Empty description="暂无变量。基线来自 catalog；可新建租户变量。catalog 为空时模板「插入变量」不可用。" />
        ) : (
          <Table<MessageTemplateVariableAdmin>
            rowKey={(r) => r.key}
            tableName="msg-center-variables"
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
        title={isCreate ? '新建变量' : '编辑变量'}
        open={Boolean(editing)}
        onCancel={() => setEditing(null)}
        width={480}
        size="small"
        className="msg-center-form-modal"
        okText="保存"
        autoClose={false}
        formProps={formProps}
      >
        <FormInfo
          column={1}
          list={[
            <FiInput
              key="key"
              name="key"
              label="key"
              rule="REQ"
              disabled={!formWritable(isCreate) || (!isCreate && Boolean(editing?.key))}
              placeholder="如 customField"
            />,
            <FiInput key="label" name="label" label="中文名" disabled={!formWritable(isCreate)} />,
            <FiSelect
              key="type"
              name="type"
              label="类型"
              disabled={!formWritable(isCreate)}
              options={[
                { value: 'string', label: '文本（string）' },
                { value: 'number', label: '数字（number）' },
              ]}
              labelTips="仅影响模板「效果预览」示例值（数字用 1，文本用中文名）；非通用配置类型系统。本期仅支持 string / number。"
              getPopupContainer={() => document.body}
              styles={{ popup: { root: { zIndex: 2000 } } }}
            />,
          ]}
        />
      </FormModal>
    </div>
  );
};

export default VariablesPanel;
