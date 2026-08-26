import { Flex, message, Space } from 'antd';
import React, { useState } from 'react';
import { Form, FormInfo, Input, ResetButton, SubmitButton, Switch } from '@/components';
import styles from './style.module.scss';

/**
 * labelTips 字符串由 core 统一包成 Info 悬停（勿再手写 TooltipInfo）。
 * 必填仍用 rule="REQ"。
 */
const FormInfoLabelTipsDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles['form-info-label-tips-demo']}>
      <Form
        onSubmit={async (formData: Record<string, unknown>) => {
          setLoading(true);
          try {
            await new Promise((r) => setTimeout(r, 400));
            message.success(JSON.stringify(formData));
          } finally {
            setLoading(false);
          }
        }}
      >
        <FormInfo
          title="labelTips 字符串 → Info 悬停"
          subtitle="core 规范化：短句 labelTips 自动图标；自定义 ReactNode 仍透传"
          column={2}
          list={[
            <Input
              key="name"
              name="name"
              label="名称"
              rule="REQ"
              placeholder="必填靠 rule"
              labelTips="短句说明会变成 label 旁 Info 图标，悬停查看。"
            />,
            <Switch
              key="strict"
              name="strict"
              label="严格模式"
              labelTips="生产强烈建议开；关闭有串租户风险。"
            />,
            <Input
              key="custom"
              name="custom"
              label="自定义 tip"
              labelTips={
                <span style={{ marginLeft: 4, color: 'var(--font-color-grey-1)' }}>
                  （自定义 Node 透传）
                </span>
              }
            />,
          ]}
        />
        <Flex justify="flex-end" style={{ marginTop: 16 }}>
          <Space>
            <ResetButton>重置</ResetButton>
            <SubmitButton type="primary" loading={loading}>
              提交
            </SubmitButton>
          </Space>
        </Flex>
      </Form>
    </div>
  );
};

export default FormInfoLabelTipsDemo;
