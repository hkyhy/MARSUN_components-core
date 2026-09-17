import { RichTextEditor } from '@/components/Editor';
import { Space, Typography } from 'antd';
import React from 'react';

/** 只读：readOnly，背景区分于 disabled */
const RichTextReadOnlyDemo: React.FC = () => (
  <Space orientation="vertical" style={{ width: '100%' }} size={12}>
    <RichTextEditor
      value="<p>只读正文：{factory} / {machine}</p>"
      readOnly
      enableVariableMention
      variables={[
        { key: 'factory', label: '分厂' },
        { key: 'machine', label: '机台' },
      ]}
    />
    <Typography.Text type="secondary">readOnly=true</Typography.Text>
  </Space>
);

export default RichTextReadOnlyDemo;
