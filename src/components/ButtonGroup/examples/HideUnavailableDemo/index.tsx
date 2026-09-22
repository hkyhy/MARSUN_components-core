import { ButtonGroup } from '@/components';
import React, { useState } from 'react';

/**
 * 跟进中：认领/下发标 unavailable → 不渲染；关闭/根因仍可见。
 * 对齐业务处置条：状态看徽章，不可再操作不置灰占位。
 */
const HideUnavailableDemo: React.FC = () => {
  const [status] = useState<'open' | 'following'>('following');
  const claimUnavailable = status === 'following';
  const followUnavailable = status === 'following';

  return (
    <ButtonGroup
      moreType="link"
      list={[
        {
          children: '认领',
          type: 'primary',
          size: 'small',
          unavailable: claimUnavailable,
          onClick: () => undefined,
        },
        {
          children: '下发任务',
          type: 'default',
          size: 'small',
          unavailable: followUnavailable,
          onClick: () => undefined,
        },
        {
          children: '关闭/暂缓',
          type: 'default',
          size: 'small',
          onClick: () => undefined,
        },
        {
          children: '查看根因分析',
          type: 'default',
          size: 'small',
          onClick: () => undefined,
        },
      ]}
    />
  );
};

export default HideUnavailableDemo;
