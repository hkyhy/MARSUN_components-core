import { Flex, Space } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { Form, FormInfo, Input, SubmitButton } from '@/form-info';
import styles from './style.module.scss';

const NewFormInfoLabelTipsDemo: React.FC = () => (
  <div
    className={classNames('new-form-info-label-tips-demo', styles['new-form-info-label-tips-demo'])}
  >
    <Form onSubmit={() => undefined}>
      <FormInfo
        title="labelTips 规范化"
        column={1}
        list={[
          <Input
            key="a"
            name="a"
            label="字段 A"
            rule="REQ"
            labelTips="短字符串自动变 Info+TooltipInfo"
          />,
          <Input
            key="b"
            name="b"
            label="字段 B"
            labelTips={<span data-testid="custom-tip">自定义节点</span>}
          />,
        ]}
      />
      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Space>
          <SubmitButton type="primary">提交</SubmitButton>
        </Space>
      </Flex>
    </Form>
  </div>
);
export default NewFormInfoLabelTipsDemo;
