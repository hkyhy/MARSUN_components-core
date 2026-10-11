import { RichTextEditor } from '@/components/Editor';
import { Space, Typography } from 'antd';
import React, { useState } from 'react';

/** RichTextEditor 基础：粗体/斜体/下划线/字色/列表/清除格式 */
const RichTextBasicDemo: React.FC = () => {
  const [html, setHtml] = useState(
    '<p>业务日 <strong>{{bizDate}}</strong>：<span style="color:#2563EB">{{machine}}</span></p>',
  );
  return (
    <Space orientation="vertical" style={{ width: '100%' }} size={12}>
      <RichTextEditor value={html} onChange={setHtml} placeholder="编辑正文" />
      <Typography.Paragraph type="secondary">
        HTML：<code>{html}</code>
      </Typography.Paragraph>
    </Space>
  );
};

export default RichTextBasicDemo;
