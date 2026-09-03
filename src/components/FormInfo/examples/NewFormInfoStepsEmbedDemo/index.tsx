import { Flex, Space } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { Form, Input, ResetButton, Steps, SubmitButton } from '@/form-info';
import styles from './style.module.scss';

const NewFormInfoStepsEmbedDemo: React.FC = () => (
  <div
    className={classNames(
      'new-form-info-steps-embed-demo',
      styles['new-form-info-steps-embed-demo'],
    )}
  >
    <Form onSubmit={() => undefined}>
      <Steps
        title="嵌入父 Form 分步"
        items={[
          {
            title: '第一步',
            list: [<Input key="a" name="a" label="字段 A" rule="REQ" />],
          },
          {
            title: '第二步',
            list: [<Input key="b" name="b" label="字段 B" rule="REQ" />],
          },
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
export default NewFormInfoStepsEmbedDemo;
