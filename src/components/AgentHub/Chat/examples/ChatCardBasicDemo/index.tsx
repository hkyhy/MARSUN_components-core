import ChatCard from '@/components/AgentHub/Chat/List/ChatCard';
import { message } from 'antd';
import React from 'react';
import { mockChatAssistants, mockDatasets } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const ChatCardBasicDemo: React.FC = () => (
  <div className={classNames('chat-card-basic-demo-block6', styles['chat-card-basic-demo-block6'])}>
    {mockChatAssistants.map((chat) => (
      <ChatCard
        key={chat.id}
        chat={chat}
        datasets={mockDatasets}
        onStartChat={(c) => message.info(`开始对话：${c.name}`)}
        onEdit={(c) => message.info(`编辑：${c.name}`)}
        onDelete={(c) => message.success(`已删除：${c.name}`)}
      />
    ))}
  </div>
);

export default ChatCardBasicDemo;
