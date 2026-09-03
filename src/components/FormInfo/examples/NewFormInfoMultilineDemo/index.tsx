import { Flex, Space, message } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { Form, FormInfo, Input, ResetButton, SubmitButton, TextArea } from '@/form-info';
import styles from './style.module.scss';

/**
 * 对齐上游「多行」：多个 TextArea / block 字段
 */
const NewFormInfoMultilineDemo: React.FC = () => (
  <div
    className={classNames('new-form-info-multiline-demo', styles['new-form-info-multiline-demo'])}
  >
    <Form
      data={{ title: '项目周报' }}
      onSubmit={async (data: Record<string, unknown>) => {
        message.success(`已提交：${String(data.title ?? '')}`);
      }}
    >
      <FormInfo
        title="多行文本"
        column={1}
        gap={20}
        list={[
          <Input key="title" name="title" label="标题" rule="REQ" />,
          <TextArea key="summary" name="summary" label="摘要" rule="REQ" block rows={3} />,
          <TextArea key="progress" name="progress" label="本周进展" block rows={4} />,
          <TextArea key="risks" name="risks" label="风险与阻塞" block rows={3} />,
          <TextArea key="next" name="next" label="下周计划" block rows={3} />,
        ]}
      />
      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Space>
          <ResetButton>重置</ResetButton>
          <SubmitButton type="primary">提交</SubmitButton>
        </Space>
      </Flex>
    </Form>
  </div>
);

export default NewFormInfoMultilineDemo;
