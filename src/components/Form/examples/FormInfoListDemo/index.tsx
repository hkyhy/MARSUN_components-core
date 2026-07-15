import { Divider, Flex, message, Space } from 'antd';
import React, { useState } from 'react';
import {
  Form,
  FormInfo,
  Input,
  List,
  MultiField,
  ResetButton,
  SubmitButton,
  TextArea,
} from '@/components';

const FormInfoListDemo: React.FC = () => {
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
        name: '张三',
        department: '技术研发部',
        certificates: ['PMP'],
        workExperience: [
          {
            companyName: '阿里巴巴集团',
            jobTitle: '高级开发工程师',
            workYears: '3年',
          },
        ],
      }}
      onSubmit={handleSubmit}
    >
      <FormInfo
        title="基本信息"
        column={2}
        list={[
          <Input key="name" name="name" label="姓名" rule="REQ" placeholder="请输入姓名" />,
          <Input
            key="department"
            name="department"
            label="部门"
            rule="REQ"
            placeholder="所属部门"
          />,
          <MultiField
            key="certificates"
            name="certificates"
            label="职业证书"
            field={Input}
            block
            addText="添加证书"
          />,
        ]}
      />
      <Divider />
      <List
        title="工作经历"
        name="workExperience"
        itemTitle={({ index, data }) =>
          (data?.companyName as string | undefined) || `工作经历 ${index + 1}`
        }
        important
        maxLength={5}
        addText="添加工作经历"
        list={[
          <Input key="companyName" name="companyName" label="公司名称" rule="REQ" />,
          <Input key="jobTitle" name="jobTitle" label="职位" rule="REQ" />,
          <Input key="workYears" name="workYears" label="工作年限" placeholder="例如：3年" />,
          <TextArea
            key="workDescription"
            name="workDescription"
            label="工作描述"
            placeholder="主要工作内容"
            block
          />,
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

export default FormInfoListDemo;
