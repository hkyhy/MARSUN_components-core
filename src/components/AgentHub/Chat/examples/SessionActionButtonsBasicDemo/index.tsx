import { SessionActionButtons } from '@/components/AgentHub/Chat';
import { message } from 'antd';
import React, { useState } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

const SessionActionButtonsBasicDemo: React.FC = () => {
  const [streaming, setStreaming] = useState(false);

  return (
    <div className={classNames('session-action-buttons-basic-demo-block22', styles['session-action-buttons-basic-demo-block22'])}>
      <SessionActionButtons
        streaming={streaming}
        clearDisabled={false}
        onClearConversation={() => message.success('已清空当前对话')}
      />
      <label className={classNames('session-action-buttons-basic-demo-block23', styles['session-action-buttons-basic-demo-block23'])}>
        <input
          type="checkbox"
          checked={streaming}
          onChange={(e) => setStreaming(e.target.checked)}
        />
        模拟生成中（禁用清空）
      </label>
    </div>
  );
};

export default SessionActionButtonsBasicDemo;
