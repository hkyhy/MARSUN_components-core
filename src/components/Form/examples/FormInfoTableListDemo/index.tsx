import { Flex, message, Space } from 'antd';
import React, { useState } from 'react';
import {
  Form,
  FormInfo,
  Input,
  ResetButton,
  SubmitButton,
  TableList,
  TextArea,
} from '@/components';

const FormInfoTableListDemo: React.FC = () => {
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
        projectName: '质量分析平台',
        contacts: [
          { name: '李四', role: '产品经理', phone: '13800138000' },
          { name: '王五', role: '前端工程师', phone: '13900139000' },
        ],
      }}
      onSubmit={handleSubmit}
    >
      <FormInfo
        title="项目信息"
        column={2}
        list={[
          <Input
            key="projectName"
            name="projectName"
            label="项目名称"
            rule="REQ"
            placeholder="请输入项目名称"
          />,
          <TextArea key="summary" name="summary" label="项目摘要" placeholder="简要说明" block />,
        ]}
      />
      <TableList
        title="联系人"
        name="contacts"
        addText="添加联系人"
        itemTitle={({ index, data }) => (data?.name as string | undefined) || `联系人 ${index + 1}`}
        list={[
          <Input key="name" name="name" label="姓名" rule="REQ" placeholder="姓名" />,
          <Input key="role" name="role" label="角色" rule="REQ" placeholder="角色" />,
          <Input key="phone" name="phone" label="手机号" rule="TEL" placeholder="11位手机号" />,
          <Input key="email" name="email" label="邮箱" rule="EMAIL" placeholder="企业邮箱" />,
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

export default FormInfoTableListDemo;
