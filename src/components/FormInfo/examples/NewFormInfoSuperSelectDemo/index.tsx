import { message, Space } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Form, FormInfo, ResetButton, SubmitButton, SuperSelect } from '@/form-info';
import styles from './style.module.scss';

const factoryOptions = [
  { value: 'F01', label: '一分厂' },
  { value: 'F07', label: '七分厂' },
  { value: 'F09', label: '潜山工厂一车间' },
];

/** FormInfo · SuperSelect 全选 Demo */
const NewFormInfoSuperSelectDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div
      className={classNames(
        'new-form-info-super-select-demo',
        styles['new-form-info-super-select-demo'],
      )}
    >
      <Form
        data={{ factoryCodes: [] as string[], oneFactory: undefined }}
        onSubmit={async (data: Record<string, unknown>) => {
          setLoading(true);
          try {
            await new Promise((r) => setTimeout(r, 300));
            message.success(`提交：${JSON.stringify(data)}`);
          } finally {
            setLoading(false);
          }
        }}
      >
        <FormInfo
          title="SuperSelect（Form 全选）"
          column={2}
          list={[
            <SuperSelect
              key="factoryCodes"
              name="factoryCodes"
              label="分厂（多选+全选）"
              rule="REQ"
              options={factoryOptions}
              allowSelectedAll
              placeholder="多选分厂"
              labelTips="勾选全选后 form 值为 ['all']，业务写路径可映射为 *"
            />,
            <SuperSelect
              key="oneFactory"
              name="oneFactory"
              label="分厂（单选）"
              single
              options={factoryOptions}
              placeholder="选择分厂"
            />,
          ]}
        />
        <Space style={{ marginTop: 16 }}>
          <SubmitButton type="primary" loading={loading}>
            提交
          </SubmitButton>
          <ResetButton>重置</ResetButton>
        </Space>
      </Form>
    </div>
  );
};

export default NewFormInfoSuperSelectDemo;
