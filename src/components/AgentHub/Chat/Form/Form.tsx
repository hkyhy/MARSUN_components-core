import type { Dataset } from '@/components/AgentHub/types';
import type { FormInstance } from 'antd';
import { Form, Input, Select } from 'antd';
import React from 'react';

export interface ChatAssistantFormProps {
  form: FormInstance;
  datasets: Dataset[];
  initialValues?: {
    name?: string;
    description?: string;
    dataset_ids?: string[];
    prologue?: string;
    empty_response?: string;
  };
}

const ChatAssistantForm: React.FC<ChatAssistantFormProps> = ({ form, datasets, initialValues }) => {
  const kbOptions = datasets.map((d) => ({ label: d.name, value: d.id }));

  return (
    <Form form={form} layout="vertical" initialValues={initialValues}>
      <Form.Item
        name="name"
        label="助手名称"
        rules={[
          { required: true, message: '请输入助手名称' },
          { max: 64, message: '名称不超过 64 个字符' },
        ]}
      >
        <Input placeholder="请输入问答助手名称" />
      </Form.Item>

      <Form.Item name="description" label="描述">
        <Input.TextArea rows={2} placeholder="请输入助手描述（可选）" />
      </Form.Item>

      <Form.Item name="dataset_ids" label="关联知识库">
        <Select
          mode="multiple"
          options={kbOptions}
          placeholder="请选择关联的知识库（可多选）"
          allowClear
          showSearch
          filterOption={(input, option) =>
            String(option?.label ?? '')
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        />
      </Form.Item>

      <Form.Item name="prologue" label="开场白">
        <Input.TextArea rows={2} placeholder="用户进入对话时显示的开场内容（可选）" />
      </Form.Item>

      <Form.Item name="empty_response" label="无答案回复">
        <Input placeholder="检索不到内容时的默认回复（可选）" />
      </Form.Item>
    </Form>
  );
};

export default ChatAssistantForm;
