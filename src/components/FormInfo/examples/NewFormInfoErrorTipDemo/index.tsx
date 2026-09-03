import { Flex, Space } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { ErrorTip, Form, FormInfo, Input, SubmitButton } from '@/form-info';
import styles from './style.module.scss';

const NewFormInfoErrorTipDemo: React.FC = () => (
  <div
    className={classNames('new-form-info-error-tip-demo', styles['new-form-info-error-tip-demo'])}
  >
    <Form onSubmit={() => undefined}>
      <FormInfo
        title="ErrorTip"
        column={1}
        list={[
          <ErrorTip
            key="email"
            name="email"
            errorRender={(err) => <span>{String(err.errMsg ?? '校验失败')}</span>}
          >
            <Input name="email" label="邮箱" rule="REQ EMAIL" />
          </ErrorTip>,
        ]}
      />
      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Space>
          <SubmitButton type="primary">触发校验</SubmitButton>
        </Space>
      </Flex>
    </Form>
  </div>
);
export default NewFormInfoErrorTipDemo;
