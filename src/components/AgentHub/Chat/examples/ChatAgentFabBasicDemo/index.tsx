import ChatAgentFab from '@/components/AgentHub/Chat/Detail/ChatAgentFab';
import ChatAgentFabLayout from '@/components/AgentHub/Chat/Detail/ChatAgentFabLayout';
import ChatPanel from '@/components/AgentHub/Chat/Detail/ChatPanel';
import CitationPanel from '@/components/AgentHub/Chat/Detail/CitationPanel';
import { Maximize2, Minimize2 } from '@/components/Icons';
import { useCitationPanel } from '@/components/AgentHub/Chat/hooks';
import { extractCitations } from '@/components/AgentHub/Chat/utils';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import { mockAssistantMessage, mockSessionReference, mockUserMessage } from '../mock';
import styles from './style.module.scss';

const ChatAgentFabBasicDemo: React.FC = () => {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState('');
  const [panelFullscreen, setPanelFullscreen] = useState(false);
  const [messages, setMessages] = useState([mockUserMessage, mockAssistantMessage]);
  const {
    citationOpen,
    panelCitations,
    highlightedCitationIndex,
    handleCitationClick,
    closeCitationPanel,
    resetCitationState,
  } = useCitationPanel();

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setPanelFullscreen(false);
  };

  const handleSendMessage = (text: string) => {
    resetCitationState();
    const userId = `demo-user-${messages.length}`;
    const assistantId = `demo-assistant-${messages.length}`;
    const citations = extractCitations(mockSessionReference);

    setMessages((prev) => [
      ...prev,
      { id: userId, role: 'user' as const, content: text },
      {
        id: assistantId,
        role: 'assistant' as const,
        content: `已收到「${text}」。根据制度文档 [ID:1]，请参考考勤与休假相关规定 [ID:2]。`,
        citations,
      },
    ]);
  };

  const headerActions = useMemo(
    () => (
      <div className="chat-panel-header-icon-actions">
        <Tooltip title={panelFullscreen ? '退出全屏' : '全屏'}>
          <Button
            type="text"
            size="small"
            icon={panelFullscreen ? <Minimize2 /> : <Maximize2 />}
            aria-label={panelFullscreen ? '退出全屏' : '全屏'}
            onClick={() => setPanelFullscreen((v) => !v)}
          />
        </Tooltip>
      </div>
    ),
    [panelFullscreen],
  );

  return (
    <div
      className={classNames(
        'chat-agent-fab-basic-demo-root',
        styles['chat-agent-fab-basic-demo-root'],
      )}
    >
      <ChatAgentFab
        open={open}
        onOpenChange={handleOpenChange}
        panelExpanded={citationOpen}
        panelFullscreen={panelFullscreen}
        closeOnClickOutside={!panelFullscreen}
        panelAriaLabel="AI 助手"
      >
        <ChatAgentFabLayout
          main={
            <ChatPanel
              title="制度问答"
              subtitle="浮动助手 + reference 引用侧栏 + 全屏高度"
              showCloseButton
              onClose={() => handleOpenChange(false)}
              headerActions={headerActions}
              messages={messages}
              onCitationClick={handleCitationClick}
              followUpItems={['年假有多少天？', '报销需要哪些材料？']}
              onSendMessage={handleSendMessage}
              inputValue={input}
              onInputChange={setInput}
              onSend={() => setInput('')}
            />
          }
          citationAside={
            citationOpen ? (
              <CitationPanel
                citations={panelCitations}
                highlightedIndex={highlightedCitationIndex}
                onClose={closeCitationPanel}
              />
            ) : null
          }
        />
      </ChatAgentFab>
    </div>
  );
};

export default ChatAgentFabBasicDemo;
