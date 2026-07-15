import { Flex, message } from 'antd';
import React, { useState } from 'react';
import { CancelButton, FormInfo, FormSteps, Input, SubmitButton, TextArea } from '@/components';

const formData = {
  employeeName: '王五',
  employeeId: 'EMP20240023',
  phone: '13900139000',
  department: '技术研发部',
  position: '前端开发工程师',
  bankName: '中国工商银行',
  bankAccount: '6222021234567890123',
};

const FormInfoStepsDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      message.success('步骤表单提交成功');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormSteps
      autoStep
      onComplete={handleComplete}
      items={[
        {
          title: '个人信息',
          formProps: { data: formData },
          children: (
            <>
              <FormInfo
                title="个人资料"
                column={2}
                list={[
                  <Input key="employeeName" name="employeeName" label="姓名" rule="REQ" />,
                  <Input key="employeeId" name="employeeId" label="工号" rule="REQ" disabled />,
                  <Input
                    key="phone"
                    name="phone"
                    label="手机号"
                    rule="REQ TEL"
                    placeholder="11位手机号"
                  />,
                  <TextArea
                    key="skills"
                    name="skills"
                    label="技能特长"
                    placeholder="专业技能"
                    block
                  />,
                ]}
              />
              <Flex justify="center" gap={8} style={{ marginTop: 16 }}>
                <CancelButton>取消</CancelButton>
                <SubmitButton>下一步</SubmitButton>
              </Flex>
            </>
          ),
        },
        {
          title: '岗位信息',
          formProps: { data: formData },
          children: (
            <>
              <FormInfo
                title="岗位配置"
                column={2}
                list={[
                  <Input key="department" name="department" label="所属部门" rule="REQ" />,
                  <Input key="position" name="position" label="职位名称" rule="REQ" />,
                  <Input key="level" name="level" label="职级" placeholder="例如：P6" />,
                  <Input
                    key="entryDate"
                    name="entryDate"
                    label="入职日期"
                    placeholder="入职日期"
                  />,
                ]}
              />
              <Flex justify="center" gap={8} style={{ marginTop: 16 }}>
                <CancelButton>取消</CancelButton>
                <SubmitButton>下一步</SubmitButton>
              </Flex>
            </>
          ),
        },
        {
          title: '银行账户',
          formProps: { data: formData },
          children: (
            <>
              <FormInfo
                title="银行信息"
                column={2}
                list={[
                  <Input key="bankName" name="bankName" label="开户银行" rule="REQ" />,
                  <Input key="bankAccount" name="bankAccount" label="银行账号" rule="REQ" />,
                  <Input key="bankBranch" name="bankBranch" label="开户支行" />,
                ]}
              />
              <Flex justify="center" gap={8} style={{ marginTop: 16 }}>
                <CancelButton>取消</CancelButton>
                <SubmitButton type="primary" loading={loading}>
                  完成
                </SubmitButton>
              </Flex>
            </>
          ),
        },
      ]}
    />
  );
};

export default FormInfoStepsDemo;
