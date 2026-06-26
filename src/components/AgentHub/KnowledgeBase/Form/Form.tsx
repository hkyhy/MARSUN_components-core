import { CHUNK_METHOD_OPTIONS, EMBEDDING_MODEL_OPTIONS } from '../constants';
import { Form, Input, Select } from 'antd';
import type { FormInstance } from 'antd';
import React from 'react';

export interface KnowledgeBaseFormProps {
  form: FormInstance;
  initialValues?: {
    name?: string;
    description?: string;
    embedding_model?: string;
    chunk_method?: string;
  };
}

const KnowledgeBaseForm: React.FC<KnowledgeBaseFormProps> = ({ form, initialValues }) => {
  return (
    <Form form={form} layout="vertical" initialValues={initialValues}>
      <Form.Item
        name="name"
        label="知识库名称"
        rules={[
          { required: true, message: '请输入知识库名称' },
          { max: 64, message: '名称不超过 64 个字符' },
        ]}
      >
        <Input placeholder="请输入知识库名称" />
      </Form.Item>

      <Form.Item name="description" label="描述">
        <Input.TextArea rows={3} placeholder="请输入知识库描述（可选）" />
      </Form.Item>

      <Form.Item name="embedding_model" label="Embedding 模型">
        <Select
          options={EMBEDDING_MODEL_OPTIONS}
          placeholder="请选择 Embedding 模型（可选）"
          allowClear
        />
      </Form.Item>

      <Form.Item name="chunk_method" label="分块方式">
        <Select options={CHUNK_METHOD_OPTIONS} placeholder="请选择分块方式（可选）" allowClear />
      </Form.Item>
    </Form>
  );
};

export default KnowledgeBaseForm;
