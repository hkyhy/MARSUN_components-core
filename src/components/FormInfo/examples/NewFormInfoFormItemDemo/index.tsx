import { Flex, Space, Typography } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { Form, FormInfo, FormItem, Input, SubmitButton } from '@/form-info';
import styles from './style.module.scss';

const NewFormInfoFormItemDemo: React.FC = () => (
  <div
    className={classNames('new-form-info-form-item-demo', styles['new-form-info-form-item-demo'])}
  >
    <Form data={{ name: 'FormItem' }} onSubmit={() => undefined}>
      <FormInfo column={1} list={[<Input key="name" name="name" label="姓名" />]} />
      <FormItem>
        {({ formData }) => (
          <Typography.Paragraph style={{ marginTop: 12 }}>
            formData.name = {String((formData as Record<string, unknown> | undefined)?.name ?? '')}
          </Typography.Paragraph>
        )}
      </FormItem>
      <Flex justify="flex-end">
        <Space>
          <SubmitButton type="primary">提交</SubmitButton>
        </Space>
      </Flex>
    </Form>
  </div>
);
export default NewFormInfoFormItemDemo;
