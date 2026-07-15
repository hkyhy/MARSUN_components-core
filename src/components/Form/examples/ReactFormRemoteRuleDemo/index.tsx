import { Alert, Tag, message } from 'antd';
import React from 'react';
import { FieldInput, FormResetButton, FormSubmitButton, ReactForm, Space } from '../kneReactForm';

const checkUsernameUnique = async (value: string) => {
  if (!value) {
    return { result: false, errMsg: '用户名不能为空' };
  }
  const existing = ['admin', 'test', 'user', 'root'];
  await new Promise((resolve) => setTimeout(resolve, 800));
  if (existing.includes(value)) {
    return { result: false, errMsg: '该用户名已被占用' };
  }
  return { result: true, errMsg: '' };
};

const checkPhoneValid = async (value: string) => {
  if (!value) {
    return { result: false, errMsg: '手机号不能为空' };
  }
  await new Promise((resolve) => setTimeout(resolve, 600));
  const blackList = ['13800138000', '13900139000'];
  if (blackList.includes(value)) {
    return { result: false, errMsg: '该手机号已被注册' };
  }
  return { result: true, errMsg: '' };
};

const ReactFormRemoteRuleDemo: React.FC = () => {
  return (
    <>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="异步校验：失焦后模拟远程接口"
        description={
          <span>
            占用用户名：
            <Tag color="red">admin</Tag>
            <Tag color="red">test</Tag>
            ；已注册手机：
            <Tag color="red">13800138000</Tag>
          </span>
        }
      />
      <ReactForm
        rules={{
          CHECK_USERNAME: checkUsernameUnique,
          CHECK_PHONE: checkPhoneValid,
        }}
        data={{ username: '', phone: '' }}
        onSubmit={async (data: Record<string, unknown>) => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          message.success(`注册成功：${JSON.stringify(data)}`);
        }}
      >
        <FieldInput
          name="username"
          label="用户名"
          rule="REQ LEN-3-20 CHECK_USERNAME"
          placeholder="请输入用户名"
        />
        <FieldInput
          name="phone"
          label="手机号"
          rule="REQ TEL CHECK_PHONE"
          placeholder="请输入手机号"
        />
        <Space>
          <FormSubmitButton>注册</FormSubmitButton>
          <FormResetButton />
        </Space>
      </ReactForm>
    </>
  );
};

export default ReactFormRemoteRuleDemo;
