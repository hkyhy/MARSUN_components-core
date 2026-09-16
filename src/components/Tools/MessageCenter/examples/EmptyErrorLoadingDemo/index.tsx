import { MessageTemplateAdmin } from '@/components/Tools/MessageCenter';
import { Segmented, Space } from 'antd';
import React, { useCallback, useState } from 'react';

type Mode = 'empty' | 'error' | 'loading';

/** 6. 空 / 错 / 加载 */
const EmptyErrorLoadingDemo: React.FC = () => {
  const [mode, setMode] = useState<Mode>('empty');

  const fetchTemplates = useCallback(async () => {
    if (mode === 'loading') {
      await new Promise((r) => setTimeout(r, 60_000));
    }
    if (mode === 'error') {
      throw new Error('模拟拉取失败：msg-center 不可达');
    }
    return [];
  }, [mode]);

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Segmented
        value={mode}
        options={[
          { label: '空', value: 'empty' },
          { label: '错', value: 'error' },
          { label: '加载', value: 'loading' },
        ]}
        onChange={(v) => setMode(v as Mode)}
      />
      <MessageTemplateAdmin
        key={mode}
        canWrite={false}
        fetchTemplates={fetchTemplates}
        emptyText="暂无模板（空态示例）"
      />
    </Space>
  );
};

export default EmptyErrorLoadingDemo;
