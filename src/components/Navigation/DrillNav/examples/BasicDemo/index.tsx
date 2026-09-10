import { DrillNav } from '@/components';
import { Space } from 'antd';
import React, { useState } from 'react';

/** DrillNav：返回 + 步骤胶囊（current / done / disabled） */
const BasicDemo: React.FC = () => {
  const [currentId, setCurrentId] = useState('process');

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <DrillNav
        backLabel="返回上一级"
        onBack={() => setCurrentId('factory')}
        currentId={currentId}
        title="潜山工厂 · 下钻示例"
        subtitle="已完成步可点回"
        steps={[
          { id: 'factory', label: '工厂', onClick: () => setCurrentId('factory') },
          { id: 'process', label: '工序', onClick: () => setCurrentId('process') },
          { id: 'machine', label: '机台' },
        ]}
      />
      <DrillNav
        currentId="factory"
        steps={[
          { id: 'factory', label: '仅步骤（无返回）' },
          { id: 'process', label: '下一层' },
        ]}
      />
    </Space>
  );
};

export default BasicDemo;
