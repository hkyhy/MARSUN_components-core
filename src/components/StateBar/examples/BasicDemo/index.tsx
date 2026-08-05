import StateBar from '@/components/StateBar';
import { Button, Card, Radio, Space } from 'antd';
import React, { useState } from 'react';

const STATE_OPTIONS = [
  { key: 'all', tab: '全部' },
  { key: 'pending', tab: '待处理' },
  { key: 'done', tab: '已完成' },
];

/** StateBar 基础：type / size / isInner / tabBarExtraContent */
const BasicDemo: React.FC = () => {
  const [type, setType] = useState<'tab' | 'radio' | 'step'>('tab');
  const [size, setSize] = useState<'small' | 'middle' | 'large'>('middle');
  const [isInner, setIsInner] = useState(false);
  const [activeKey, setActiveKey] = useState('all');

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Radio.Group
        value={type}
        optionType="button"
        buttonStyle="solid"
        options={[
          { label: 'tab', value: 'tab' },
          { label: 'radio', value: 'radio' },
          { label: 'step', value: 'step' },
        ]}
        onChange={(e) => setType(e.target.value)}
      />
      <Radio.Group
        value={size}
        optionType="button"
        buttonStyle="solid"
        options={[
          { label: 'small', value: 'small' },
          { label: 'middle', value: 'middle' },
          { label: 'large', value: 'large' },
        ]}
        onChange={(e) => setSize(e.target.value)}
      />
      <Radio.Group
        value={isInner}
        optionType="button"
        buttonStyle="solid"
        options={[
          { label: 'inner', value: true },
          { label: 'normal', value: false },
        ]}
        onChange={(e) => setIsInner(e.target.value)}
      />
      <Card size="small" title="受控 StateBar">
        <StateBar
          type={type}
          size={size}
          isInner={isInner}
          activeKey={activeKey}
          onChange={setActiveKey}
          stateOption={STATE_OPTIONS}
          tabBarExtraContent={
            <Button type="primary" size="small">
              新建
            </Button>
          }
        />
        <div style={{ marginTop: 12 }}>当前：{activeKey}</div>
      </Card>
    </Space>
  );
};

export default BasicDemo;
