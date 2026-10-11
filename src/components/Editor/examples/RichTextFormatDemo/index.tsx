import { RichTextEditor } from '@/components/Editor';
import { Space, Typography } from 'antd';
import React, { useState } from 'react';

/**
 * 字色 / 下划线 / 清除格式；变量色块上的加粗/字色可存盘回显。
 */
const RichTextFormatDemo: React.FC = () => {
  const [html, setHtml] = useState(
    '<p><strong>{{assignee}}</strong> 你好：请处理「<span style="color:#EF4444">{{title}}</span>」。</p>',
  );
  return (
    <Space orientation="vertical" style={{ width: '100%' }} size={12}>
      <RichTextEditor
        value={html}
        onChange={setHtml}
        enableVariableMention
        variables={[
          { key: 'assignee', label: '执行人' },
          { key: 'title', label: '标题' },
        ]}
        placeholder="试加粗变量、改字色后看下方 HTML"
        minHeight={160}
      />
      <Typography.Paragraph type="secondary">
        HTML：<code>{html}</code>
      </Typography.Paragraph>
    </Space>
  );
};

export default RichTextFormatDemo;
