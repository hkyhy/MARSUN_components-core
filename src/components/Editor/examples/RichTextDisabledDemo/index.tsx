import { RichTextEditor } from '@/components/Editor';
import { Space, Typography } from 'antd';
import React from 'react';

/** disabled：不可编辑 */
const RichTextDisabledDemo: React.FC = () => (
  <Space orientation="vertical" style={{ width: '100%' }} size={12}>
    <RichTextEditor
      value="<p>disabled 态：不可编辑</p>"
      disabled
      enableVariableMention
      variables={[{ key: 'factory', label: '分厂' }]}
    />
    <Typography.Text type="secondary">disabled=true</Typography.Text>
  </Space>
);

export default RichTextDisabledDemo;
