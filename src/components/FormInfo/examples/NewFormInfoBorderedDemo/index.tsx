import { Flex, Space, message } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { Form, FormInfo, Input, ResetButton, SubmitButton, TextArea } from '@/form-info';
import styles from './style.module.scss';

/**
 * 对齐上游「边框模式示例」：FormInfo bordered
 */
const NewFormInfoBorderedDemo: React.FC = () => (
  <div className={classNames('new-form-info-bordered-demo', styles['new-form-info-bordered-demo'])}>
    <Form
      data={{ name: '王五', dept: '平台' }}
      onSubmit={async (data: Record<string, unknown>) => {
        message.success(`已保存：${String(data.name ?? '')}`);
      }}
    >
      <Flex vertical gap={16}>
        <FormInfo
          bordered
          title="基本信息（边框）"
          subtitle="FormInfo bordered"
          column={2}
          gap={20}
          list={[
            <Input key="name" name="name" label="姓名" rule="REQ" />,
            <Input key="dept" name="dept" label="部门" rule="REQ" />,
            <Input key="city" name="city" label="城市" />,
            <Input key="manager" name="manager" label="上级" />,
          ]}
        />
        <FormInfo
          bordered
          title="备注"
          column={1}
          gap={20}
          list={[<TextArea key="remarks" name="remarks" label="说明" block rows={3} />]}
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

export default NewFormInfoBorderedDemo;
