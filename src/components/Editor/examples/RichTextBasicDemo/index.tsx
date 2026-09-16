import { RichTextEditor } from '@/components/Editor';
import { Space, Typography } from 'antd';
import React, { useState } from 'react';

/** RichTextEditor（CKEditor）基础示例。业务：`@hkyhy/marsun-components-core/editor`（L2） */
const RichTextBasicDemo: React.FC = () => {
  const [html, setHtml] = useState('<p>业务日 <strong>{bizDate}</strong>：{machine}</p>');
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
