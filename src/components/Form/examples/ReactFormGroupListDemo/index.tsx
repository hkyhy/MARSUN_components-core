import { Button, message } from 'antd';
import React, { useRef } from 'react';
import type { GroupListRenderProps } from '@/components';
import {
  FieldInput,
  FormResetButton,
  FormSubmitButton,
  GroupList,
  ReactForm,
  Space,
} from '../kneReactForm';

type GroupListApi = { onAdd: () => void };

const ReactFormGroupListDemo: React.FC = () => {
  const listRef = useRef<GroupListApi | null>(null);

  return (
    <ReactForm
      onSubmit={async (data: Record<string, unknown>) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        message.success(`提交成功：${JSON.stringify(data)}`);
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => listRef.current?.onAdd()}>
          添加联系人
        </Button>
      </div>
      <GroupList ref={listRef} name="contacts" defaultLength={1}>
        {({ index, onRemove, length }: GroupListRenderProps) => (
          <div
            key={index}
            style={{
              padding: 16,
              marginBottom: 12,
              border: '1px solid var(--font-color-grey-3, #ddd)',
              borderRadius: 8,
              background: 'var(--bg-color-grey, #fafafa)',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 12 }}>
              联系人 {index + 1}（共 {length} 项）
            </div>
            <Space wrap align="start">
              <FieldInput name="name" label="姓名" rule="REQ LEN-0-10" width={160} />
              <FieldInput name="phone" label="手机号" rule="TEL" width={160} />
              <Button danger size="small" onClick={onRemove} style={{ marginTop: 28 }}>
                删除
              </Button>
            </Space>
          </div>
        )}
      </GroupList>
      <Space style={{ marginTop: 8 }}>
        <FormSubmitButton>提交</FormSubmitButton>
        <FormResetButton />
      </Space>
    </ReactForm>
  );
};

export default ReactFormGroupListDemo;
