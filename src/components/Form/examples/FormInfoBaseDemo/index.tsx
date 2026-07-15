import { Flex, message, Space } from 'antd';
import React, { useState } from 'react';
import { Form, FormInfo, Input, ResetButton, SubmitButton, TextArea } from '@/components';

const FormInfoBaseDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      message.success(`提交成功：${JSON.stringify(formData)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      data={{
        employeeId: 'EMP20240001',
        name: '张三',
        department: '技术研发部',
        position: '高级前端工程师',
      }}
      onSubmit={handleSubmit}
    >
      <FormInfo
        title="员工基本信息"
        subtitle="业务表单标准：@hkyhy/marsun-components-core 两列布局"
        column={2}
        gap={20}
        list={[
          <Input key="employeeId" name="employeeId" label="工号" rule="REQ" disabled />,
          <Input key="name" name="name" label="姓名" rule="REQ" placeholder="请输入员工姓名" />,
          <Input
            key="department"
            name="department"
            label="所属部门"
            rule="REQ"
            placeholder="例如：技术研发部"
          />,
          <Input
            key="position"
            name="position"
            label="职位"
            rule="REQ"
            placeholder="例如：高级前端工程师"
          />,
          <Input
            key="phone"
            name="phone"
            label="联系电话"
            rule="REQ TEL"
            placeholder="请输入11位手机号"
          />,
          <Input
            key="email"
            name="email"
            label="邮箱"
            rule="REQ EMAIL"
            placeholder="请输入企业邮箱"
          />,
          <TextArea key="remarks" name="remarks" label="备注信息" placeholder="其他说明" block />,
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
  );
};

export default FormInfoBaseDemo;
