import { message } from 'antd';
import React from 'react';
import { FieldInput, FormResetButton, FormSubmitButton, ReactForm, Space } from '../kneReactForm';

const ReactFormBaseDemo: React.FC = () => {
  return (
    <ReactForm
      data={{ name: '张三' }}
      onSubmit={async (data: Record<string, unknown>) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        message.success(`提交成功：${JSON.stringify(data)}`);
      }}
    >
      <FieldInput name="name" label="名称" rule="REQ LEN-0-10" placeholder="请输入名称" />
      <FieldInput name="email" label="邮箱" rule="REQ EMAIL" placeholder="请输入邮箱" />
      <FieldInput name="phone" label="手机号" rule="REQ TEL" placeholder="请输入手机号" />
      <Space>
        <FormSubmitButton>提交</FormSubmitButton>
        <FormResetButton />
      </Space>
    </ReactForm>
  );
};

export default ReactFormBaseDemo;
