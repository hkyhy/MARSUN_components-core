import ChatPanel from '@/components/AgentHub/Chat/Detail/ChatPanel';
import classNames from 'classnames';
import React, { useState } from 'react';
import { mockAssistantMessage, mockUserMessage } from '../mock';
import styles from './style.module.scss';

const ChatPanelBasicDemo: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([mockUserMessage, mockAssistantMessage]);

  const handleSendMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `demo-user-${prev.length}`, role: 'user' as const, content: text },
    ]);
  };

  return (
    <div className={classNames('chat-panel-basic-demo-root', styles['chat-panel-basic-demo-root'])}>
      <ChatPanel
        title="制度问答"
        subtitle="基于企业制度知识库"
        messages={messages}
        inputValue={input}
        onInputChange={setInput}
        onSend={() => setInput('')}
        followUpItems={['年假有多少天？', '报销需要哪些材料？']}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatPanelBasicDemo;
