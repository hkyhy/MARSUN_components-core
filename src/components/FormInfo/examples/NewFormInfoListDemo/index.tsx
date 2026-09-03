import { Flex, Space, message } from 'antd';
import classNames from 'classnames';
import React, { type ComponentType } from 'react';
import {
  Form,
  FormInfo,
  Input,
  List,
  MultiField,
  ResetButton,
  SubmitButton,
  TableList,
} from '@/form-info';
import styles from './style.module.scss';

const TagInput = Input as unknown as ComponentType<Record<string, unknown>>;

/**
 * 对齐上游「一个含有多段列表的表单示例」：List + MultiField + TableList
 */
const NewFormInfoListDemo: React.FC = () => (
  <div className={classNames('new-form-info-list-demo', styles['new-form-info-list-demo'])}>
    <Form
      data={{
        members: [],
        tags: [],
        rows: [],
      }}
      onSubmit={async () => {
        message.success('已提交多段列表');
      }}
    >
      <Flex vertical gap={16}>
        <List
          title="成员列表"
          name="members"
          bordered
          defaultLength={0}
          minLength={0}
          addText="添加成员"
          itemTitle={({ index }) => `成员 ${index + 1}`}
          list={[
            <Input key="name" name="name" label="姓名" rule="REQ" />,
            <Input key="role" name="role" label="角色" />,
          ]}
        />
        <FormInfo
          bordered
          title="标签（MultiField）"
          column={1}
          gap={16}
          list={[
            <MultiField
              key="tags"
              name="tags"
              label="标签"
              field={TagInput}
              defaultLength={0}
              minLength={0}
            />,
          ]}
        />
        <TableList
          title="明细表格"
          name="rows"
          bordered
          defaultLength={0}
          minLength={0}
          list={[
            <Input key="code" name="code" label="编码" rule="REQ" />,
            <Input key="title" name="title" label="标题" />,
          ]}
        />
      </Flex>
      <Flex justify="flex-end" style={{ marginTop: 16 }}>
        <Space>
          <ResetButton>重置</ResetButton>
          <SubmitButton type="primary">提交</SubmitButton>
        </Space>
      </Flex>
    </Form>
  </div>
);

export default NewFormInfoListDemo;
