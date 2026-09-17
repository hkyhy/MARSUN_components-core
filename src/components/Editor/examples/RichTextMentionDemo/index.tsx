import { RichTextEditor } from '@/components/Editor';
import {
  applyTemplateVars,
  stripHtmlToText,
} from '@/components/Tools/MessageCenter/utils/templateCode';
import { Space, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

const VARS = [
  { key: 'factory', label: '分厂' },
  { key: 'machine', label: '机台' },
  { key: 'bizDate', label: '业务日' },
];

/** Mention 着色：`/` 插入 `{key}`，编辑区色块；预览须替换变量 */
const RichTextMentionDemo: React.FC = () => {
  const [html, setHtml] = useState('<p>分厂 {factory} · 机台 {machine}</p>');
  const previewVars = useMemo(
    () => Object.fromEntries(VARS.map((v) => [v.key, v.label || v.key])),
    [],
  );
  const preview = applyTemplateVars(stripHtmlToText(html), previewVars);

  return (
    <Space orientation="vertical" style={{ width: '100%' }} size={12}>
      <Typography.Text type="secondary">输入 / 选择 catalog 变量（色块 token）</Typography.Text>
      <RichTextEditor
        value={html}
        onChange={setHtml}
        enableVariableMention
        variables={VARS}
        placeholder="输入 / 插入变量"
      />
      <Typography.Paragraph type="secondary">预览：{preview || '—'}</Typography.Paragraph>
      <Typography.Paragraph type="secondary">
        HTML：<code>{html}</code>
      </Typography.Paragraph>
    </Space>
  );
};

export default RichTextMentionDemo;
