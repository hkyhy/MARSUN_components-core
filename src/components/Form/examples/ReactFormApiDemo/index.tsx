import { Button, Card, Space, message } from 'antd';
import React from 'react';
import {
  FieldInput,
  FormResetButton,
  FormSubmitButton,
  ReactForm,
  useFormApi,
} from '../kneReactForm';

const FormApiPanel: React.FC = () => {
  const { openApi } = useFormApi();

  return (
    <Card type="inner" title="useFormApi 操作面板" size="small" style={{ marginBottom: 16 }}>
      <Space wrap>
        <Button
          size="small"
          onClick={() => {
            const getFormData = openApi.getFormData as () => Record<string, unknown>;
            message.info(JSON.stringify(getFormData()));
          }}
        >
          读取表单数据
        </Button>
        <Button
          size="small"
          onClick={() => {
            const setField = openApi.setField as (data: { name: string; value: unknown }) => void;
            setField({ name: 'name', value: '李四' });
          }}
        >
          设置姓名为李四
        </Button>
        <Button
          size="small"
          onClick={() => {
            const setFormData = openApi.setFormData as (data: Record<string, unknown>) => void;
            setFormData({
              name: '王五',
              email: 'wangwu@company.com',
              phone: '13900139000',
            });
          }}
        >
          批量设值
        </Button>
        <Button
          size="small"
          onClick={() => {
            const validateAll = openApi.validateAll as () => void;
            validateAll();
            message.info('已触发全量校验');
          }}
        >
          手动全量校验
        </Button>
      </Space>
    </Card>
  );
};

const ReactFormApiDemo: React.FC = () => {
  return (
    <ReactForm
      data={{ name: '', email: '', phone: '' }}
      onSubmit={async (data: Record<string, unknown>) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        message.success(`提交成功：${JSON.stringify(data)}`);
      }}
    >
      <FormApiPanel />
      <FieldInput name="name" label="姓名" rule="REQ LEN-0-10" />
      <FieldInput name="email" label="邮箱" rule="REQ EMAIL" />
      <FieldInput name="phone" label="手机号" rule="REQ TEL" />
      <Space>
        <FormSubmitButton>提交</FormSubmitButton>
        <FormResetButton />
      </Space>
    </ReactForm>
  );
};

export default ReactFormApiDemo;
