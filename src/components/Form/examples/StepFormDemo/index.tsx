import { StepForm } from '@/components';
import type { StepFormItem } from '@/components';
import { Form, Input, Select } from 'antd';
import React, { useState } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

const steps: StepFormItem[] = [
  {
    key: 'basic',
    title: '基本信息',
    validateFields: ['name'],
    content: () => (
      <>
        <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
          <Input placeholder="请输入名称" />
        </Form.Item>
        <Form.Item name="type" label="类型">
          <Select
            placeholder="请选择类型"
            options={[
              { label: '类型A', value: 'a' },
              { label: '类型B', value: 'b' },
            ]}
          />
        </Form.Item>
      </>
    ),
  },
  {
    key: 'detail',
    title: '详细信息',
    validateFields: ['description'],
    content: () => (
      <Form.Item
        name="description"
        label="描述"
        rules={[{ required: true, message: '请输入描述' }]}
      >
        <Input.TextArea rows={3} placeholder="请输入描述" />
      </Form.Item>
    ),
  },
  {
    key: 'confirm',
    title: '确认提交',
    content: () => (
      <div className={classNames('step-form-demo-footer', styles['step-form-demo-footer'])}>
        请确认以上信息无误后提交
      </div>
    ),
    footer: null,
  },
];

const StepFormDemo: React.FC = () => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('basic');

  const handleOpen = () => {
    form.resetFields();
    setCurrent('basic');
    setOpen(true);
  };

  return (
    <div>
      <button
        type="button"
        className={classNames('step-form-demo-row', styles['step-form-demo-row'])}
        onClick={handleOpen}
      >
        打开步骤表单
      </button>
      <StepForm
        form={form}
        open={open}
        current={current}
        onCancel={() => setOpen(false)}
        onStepChange={setCurrent}
        steps={steps}
        width={600}
      />
    </div>
  );
};

export default StepFormDemo;
