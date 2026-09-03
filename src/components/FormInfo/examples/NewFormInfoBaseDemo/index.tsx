import { Flex, message, Space } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Form, FormInfo, Input, ResetButton, SubmitButton, TextArea } from '@/form-info';
import styles from './style.module.scss';

const NewFormInfoBaseDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (formData: Record<string, unknown>) => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      message.success(`提交成功：${JSON.stringify(formData)}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={classNames('new-form-info-base-demo', styles['new-form-info-base-demo'])}>
      <Form data={{ name: '张三', department: '研发' }} onSubmit={handleSubmit}>
        <FormInfo
          title="员工基本信息（新栈）"
          subtitle="from @hkyhy/marsun-components-core/form-info"
          column={2}
          gap={20}
          list={[
            <Input key="name" name="name" label="姓名" rule="REQ" />,
            <Input key="department" name="department" label="部门" rule="REQ" />,
            <TextArea key="remarks" name="remarks" label="备注" block />,
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
export default NewFormInfoBaseDemo;
