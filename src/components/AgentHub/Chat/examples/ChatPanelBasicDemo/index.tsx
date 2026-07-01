import ChatPanel from '@/components/AgentHub/Chat/Detail/ChatPanel';
import classNames from 'classnames';
import React, { useState } from 'react';
import { mockAssistantMessage, mockUserMessage } from '../mock';
import styles from './style.module.scss';

const ChatPanelBasicDemo: React.FC = () => {
  const [input, setInput] = useState('');

  return (
    <div className={classNames('chat-panel-basic-demo-root', styles['chat-panel-basic-demo-root'])}>
      <ChatPanel
        title="制度问答"
        subtitle="基于企业制度知识库"
        messages={[mockUserMessage, mockAssistantMessage]}
        inputValue={input}
        onInputChange={setInput}
        onSend={() => setInput('')}
        showSuggestions
        suggestions={['年假有多少天？', '报销需要哪些材料？']}
        onSuggestionClick={setInput}
      />
    </div>
  );
};

export default ChatPanelBasicDemo;
