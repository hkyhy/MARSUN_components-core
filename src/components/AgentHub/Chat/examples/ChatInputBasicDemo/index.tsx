import ChatInput from '@/components/AgentHub/Chat/Detail/ChatInput';
import { Switch, Typography } from 'antd';
import React, { useState } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

const { Text } = Typography;

const ChatInputBasicDemo: React.FC = () => {
  const [value, setValue] = useState('请问正式员工的年假有多少天？');
  const [loading, setLoading] = useState(false);

  return (
    <div className={classNames('chat-input-basic-demo-block11', styles['chat-input-basic-demo-block11'])}>
      <div className={classNames('chat-input-basic-demo-block12', styles['chat-input-basic-demo-block12'])}>
        <Text type="secondary" className={classNames('chat-input-basic-demo-block5', styles['chat-input-basic-demo-block5'])}>
          模拟生成中
        </Text>
        <Switch size="small" checked={loading} onChange={setLoading} />
      </div>
      <div className={classNames('chat-input-basic-demo-block13', styles['chat-input-basic-demo-block13'])}>
        <ChatInput
          value={value}
          loading={loading}
          onChange={setValue}
          onSend={() => setLoading(true)}
          onStop={() => setLoading(false)}
        />
      </div>
    </div>
  );
};

export default ChatInputBasicDemo;
