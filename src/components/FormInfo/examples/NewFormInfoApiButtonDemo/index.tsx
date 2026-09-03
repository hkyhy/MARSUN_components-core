import { Flex, message, Space } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { Form, FormApiButton, FormInfo, Input } from '@/form-info';
import styles from './style.module.scss';

const NewFormInfoApiButtonDemo: React.FC = () => (
  <div
    className={classNames('new-form-info-api-button-demo', styles['new-form-info-api-button-demo'])}
  >
    <Form data={{ name: '演示' }} onSubmit={() => undefined}>
      <FormInfo column={1} list={[<Input key="name" name="name" label="姓名" />]} />
      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Space>
          <FormApiButton
            type="primary"
            onClick={async (ctx) => {
              const data = (ctx as { formData?: Record<string, unknown> }).formData;
              message.info(`formData: ${JSON.stringify(data)}`);
            }}
          >
            读取 formContext
          </FormApiButton>
        </Space>
      </Flex>
    </Form>
  </div>
);
export default NewFormInfoApiButtonDemo;
