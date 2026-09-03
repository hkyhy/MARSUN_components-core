import { Flex, Space } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { Form, Input, ResetButton, SubmitButton, TableList } from '@/form-info';
import styles from './style.module.scss';

const NewFormInfoTableListDemo: React.FC = () => (
  <div
    className={classNames('new-form-info-table-list-demo', styles['new-form-info-table-list-demo'])}
  >
    <Form data={{ rows: [] }} onSubmit={() => undefined}>
      <TableList
        title="表格列表"
        name="rows"
        defaultLength={0}
        minLength={0}
        list={[
          <Input key="code" name="code" label="编码" rule="REQ" />,
          <Input key="title" name="title" label="标题" />,
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
export default NewFormInfoTableListDemo;
