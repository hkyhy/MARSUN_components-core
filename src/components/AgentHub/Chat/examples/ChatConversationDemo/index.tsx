import CitationPanel from '@/components/AgentHub/Chat/Detail/CitationPanel';
import ChatInput from '@/components/AgentHub/Chat/Detail/ChatInput';
import MessageItem from '@/components/AgentHub/Chat/Detail/MessageItem';
import type { Citation } from '@/components/AgentHub/types';
import React, { useState } from 'react';
import { mockAssistantMessage, mockCitations, mockUserMessage } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const ChatConversationDemo: React.FC = () => {
  const [input, setInput] = useState('');
  const [panelOpen, setPanelOpen] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>();
  const [citations, setCitations] = useState<Citation[]>(mockCitations);

  const handleCitationClick = (items: Citation[], index?: number) => {
    setCitations(items);
    setPanelOpen(true);
    setHighlightedIndex(index);
  };

  const handleEditMessage = (_messageId: string, content: string) => {
    setInput(content);
  };

  const handleResendMessage = (content: string) => {
    setInput(content);
  };

  return (
    <div className={classNames('chat-conversation-demo-block7', styles['chat-conversation-demo-block7'])}>
      <div className={classNames('chat-conversation-demo-block8', styles['chat-conversation-demo-block8'])}>
        <div className={classNames('chat-conversation-demo-block9', styles['chat-conversation-demo-block9'])}>
          <MessageItem
            message={mockUserMessage}
            onEditMessage={handleEditMessage}
            onResendMessage={handleResendMessage}
          />
          <MessageItem message={mockAssistantMessage} onCitationClick={handleCitationClick} />
        </div>
        <ChatInput
          value={input}
          loading={false}
          onChange={setInput}
          onSend={() => setInput('')}
        />
      </div>

      {panelOpen && (
        <div className={classNames('chat-conversation-demo-block10', styles['chat-conversation-demo-block10'])}>
          <CitationPanel
            citations={citations}
            highlightedIndex={highlightedIndex}
            onClose={() => setPanelOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatConversationDemo;
