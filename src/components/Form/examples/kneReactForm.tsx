/**
 * Showcase 字段绑定垫片：用 core 再导出的 ReactForm / useField 绑 antd Input。
 * 业务深度自定义时可从 @hkyhy/marsun-components-core 直接用引擎 API；日常优先 FormInfo。
 */
import { GroupList, ReactForm, useField, useFormApi, useReset, useSubmit } from '@/components';
import { Button, Input as AntInput, Space, Typography } from 'antd';
import type { ReactNode } from 'react';
import React from 'react';

const { Text } = Typography;

type FieldInputProps = {
  name: string;
  label?: string;
  rule?: string;
  placeholder?: string;
  type?: string;
  width?: number | string;
  associations?: Record<string, unknown>;
};

export const FieldInput: React.FC<FieldInputProps> = (props) => {
  const fieldProps = useField(props);
  const isError = fieldProps.errState === 2;
  const isValidating = fieldProps.errState === 3;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 4 }}>
        <Text type={isError ? 'danger' : undefined}>{String(fieldProps.label ?? '')}</Text>
      </div>
      <div>
        <AntInput
          type={props.type || 'text'}
          value={String(fieldProps.value ?? '')}
          onChange={(e) => {
            (fieldProps.onChange as (v: string) => void)(e.target.value);
            (fieldProps.triggerValidate as () => void)();
          }}
          onBlur={fieldProps.triggerValidate as () => void}
          placeholder={props.placeholder}
          status={isError ? 'error' : undefined}
          style={{ width: props.width || 220 }}
        />
        {fieldProps.errMsg ? (
          <Text type="danger" style={{ marginLeft: 8, fontSize: 12 }}>
            {String(fieldProps.errMsg)}
          </Text>
        ) : null}
        {isValidating ? (
          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
            验证中...
          </Text>
        ) : null}
      </div>
    </div>
  );
};

export const FormSubmitButton: React.FC<{
  children?: ReactNode;
  isPassButton?: boolean;
}> = ({ children, isPassButton = false }) => {
  const { isLoading, isPass, onClick } = useSubmit();
  return (
    <Button
      type="primary"
      onClick={onClick}
      disabled={isPassButton ? isLoading || !isPass : isLoading}
      loading={isLoading}
    >
      {children}
    </Button>
  );
};

export const FormResetButton: React.FC<{ children?: ReactNode }> = ({ children = '重置' }) => {
  const { onClick } = useReset();
  return <Button onClick={onClick}>{children}</Button>;
};

export { ReactForm, GroupList, useFormApi, useField, useSubmit, useReset, Space };
