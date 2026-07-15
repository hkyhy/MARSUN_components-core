import { Card, Tag, message } from 'antd';
import React from 'react';
import { FieldInput, FormResetButton, FormSubmitButton, ReactForm, Space } from '../kneReactForm';

type AssocCtx = {
  target: unknown;
  openApi: {
    getFormData: () => Record<string, unknown>;
    setFieldValue: (target: unknown, value: unknown) => void;
  };
};

const ReactFormAssociationsDemo: React.FC = () => {
  return (
    <ReactForm
      data={{ familyName: '张', firstName: '三', money: '100', ratio: '4' }}
      onSubmit={async (data: Record<string, unknown>) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        message.success(`提交成功：${JSON.stringify(data)}`);
      }}
    >
      <Card
        type="inner"
        size="small"
        title={
          <Space>
            多字段关联
            <Tag color="green">姓名拼接全名</Tag>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Space wrap>
          <FieldInput name="familyName" label="姓" rule="REQ LEN-0-10" width={120} />
          <FieldInput name="firstName" label="名" rule="REQ LEN-0-10" width={120} />
        </Space>
        <FieldInput
          name="fullName"
          label="全名"
          rule="LEN-0-20"
          associations={{
            fields: [{ name: 'familyName' }, { name: 'firstName' }],
            callback: ({ target, openApi }: AssocCtx) => {
              const { firstName, familyName } = openApi.getFormData();
              openApi.setFieldValue(
                target,
                `${String(familyName ?? '')}${String(firstName ?? '')}`,
              );
            },
          }}
        />
      </Card>

      <Card
        type="inner"
        size="small"
        title={
          <Space>
            计算关联
            <Tag color="orange">金额除以比例</Tag>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Space wrap>
          <FieldInput name="money" label="总金额" width={140} />
          <FieldInput name="ratio" label="比例" width={140} />
        </Space>
        <FieldInput
          name="all"
          label="每份金额"
          associations={{
            fields: [{ name: 'money' }, { name: 'ratio' }],
            callback: ({ target, openApi }: AssocCtx) => {
              const { money, ratio } = openApi.getFormData();
              const numMoney = parseFloat(String(money ?? '')) || 0;
              const numRatio = parseFloat(String(ratio ?? '')) || 1;
              openApi.setFieldValue(target, numRatio > 0 ? (numMoney / numRatio).toFixed(2) : '');
            },
          }}
        />
      </Card>

      <Space>
        <FormSubmitButton>提交</FormSubmitButton>
        <FormResetButton />
      </Space>
    </ReactForm>
  );
};

export default ReactFormAssociationsDemo;
