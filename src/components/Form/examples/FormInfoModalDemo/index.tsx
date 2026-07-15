import { Button, message } from 'antd';
import React, { useState } from 'react';
import { FormInfo, FormModal, Input, TextArea } from '@/components';

const FormInfoModalDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      message.success(`保存成功：${String(formData.name ?? '')}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button type="primary" onClick={() => setOpen(true)}>
        打开 FormModal
      </Button>
      <FormModal
        title="编辑员工信息"
        open={open}
        onCancel={() => setOpen(false)}
        formProps={{
          data: {
            employeeNo: 'EMP001',
            name: '李四',
            department: '产品部',
            position: '产品经理',
            phone: '13800138000',
            email: 'lisi@company.com',
          },
          onSubmit: handleSubmit,
        }}
        autoClose
        okText="保存"
        cancelText="取消"
        okType="primary"
        width={720}
        okButtonProps={{ loading }}
      >
        <FormInfo
          title="基本信息"
          column={2}
          list={[
            <Input key="employeeNo" name="employeeNo" label="工号" rule="REQ" disabled />,
            <Input key="name" name="name" label="姓名" rule="REQ" placeholder="请输入员工姓名" />,
            <Input
              key="department"
              name="department"
              label="部门"
              rule="REQ"
              placeholder="所属部门"
            />,
            <Input key="position" name="position" label="职位" rule="REQ" placeholder="职位名称" />,
            <Input
              key="phone"
              name="phone"
              label="手机号"
              rule="REQ TEL"
              placeholder="11位手机号"
            />,
            <Input key="email" name="email" label="邮箱" rule="EMAIL" placeholder="企业邮箱" />,
            <TextArea key="remarks" name="remarks" label="备注" placeholder="备注信息" block />,
          ]}
        />
      </FormModal>
    </div>
  );
};

export default FormInfoModalDemo;
