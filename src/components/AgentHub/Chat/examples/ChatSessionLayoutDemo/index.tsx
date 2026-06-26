import ChatInput from '@/components/AgentHub/Chat/Detail/ChatInput';
import CitationPanel from '@/components/AgentHub/Chat/Detail/CitationPanel';
import MessageItem from '@/components/AgentHub/Chat/Detail/MessageItem';
import SessionSidebar from '@/components/AgentHub/Chat/List/SessionSidebar';
import { useAutoScrollToBottom } from '@/components/AgentHub/Chat/hooks';
import {
  animateScrollFromTopToBottom,
  getScrollBottom,
} from '@/components/AgentHub/Chat/utils/smoothScroll';
import { VirtualScrollbar } from '@/components/VirtualScrollbar';
import type { ChatMessage, ChatSession, Citation } from '@/components/AgentHub/types';
import { message } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  mockAssistantMessage,
  mockChatAssistants,
  mockChatSessions,
  mockCitations,
  mockUserMessage,
} from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const sessionMessagesMap: Record<string, ChatMessage[]> = {
  'sess-1': [mockUserMessage, mockAssistantMessage],
  'sess-2': [
    {
      id: 'msg-u2',
      role: 'user',
      content: '报销流程需要哪些材料？',
    },
    {
      id: 'msg-a2',
      role: 'assistant',
      content:
        '请先在 OA 提交报销申请，并附上发票原件、费用明细与审批单。具体材料要求见制度文档 [ID:1]。',
      citations: mockCitations[1] ? [mockCitations[1]] : [],
    },
  ],
  'sess-3': [
    {
      id: 'msg-u3',
      role: 'user',
      content: '迟到 30 分钟怎么算？',
    },
    {
      id: 'msg-a3',
      role: 'assistant',
      content: '迟到 30 分钟以内记为迟到一次，超过 30 分钟按旷工半天处理，具体以考勤制度为准。',
    },
  ],
};

const ChatSessionLayoutDemo: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(mockChatSessions);
  const [activeSessionId, setActiveSessionId] = useState(mockChatSessions[0]?.id);
  const [input, setInput] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [showCitations, setShowCitations] = useState(false);
  const [highlightedCitationIndex, setHighlightedCitationIndex] = useState<number | undefined>();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesContentRef = useRef<HTMLDivElement>(null);
  const prevSessionIdForScrollRef = useRef<string | undefined>(undefined);
  const scrollAnimationCleanupRef = useRef<(() => void) | null>(null);

  const resetCitationState = useCallback(() => {
    setCitations([]);
    setShowCitations(false);
    setHighlightedCitationIndex(undefined);
  }, []);

  const messages = useMemo(
    () => (activeSessionId ? (sessionMessagesMap[activeSessionId] ?? []) : []),
    [activeSessionId],
  );

  const { stickToBottom } = useAutoScrollToBottom(scrollContainerRef, messagesContentRef, {
    enabled: messages.length > 0,
  });

  const scrollMessagesToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      scrollAnimationCleanupRef.current?.();
      scrollAnimationCleanupRef.current = null;

      stickToBottom();
      const container = scrollContainerRef.current;
      if (!container) return () => {};

      if (behavior === 'smooth') {
        const cleanup = animateScrollFromTopToBottom(container);
        scrollAnimationCleanupRef.current = cleanup;
        return cleanup;
      }

      const scrollInstant = () => {
        container.scrollTop = getScrollBottom(container);
      };

      scrollInstant();
      const raf1 = requestAnimationFrame(() => {
        scrollInstant();
        requestAnimationFrame(scrollInstant);
      });
      const timers = [0, 50, 150, 300].map((delay) => window.setTimeout(scrollInstant, delay));

      const cleanup = () => {
        cancelAnimationFrame(raf1);
        timers.forEach((timer) => window.clearTimeout(timer));
      };

      scrollAnimationCleanupRef.current = cleanup;
      return cleanup;
    },
    [stickToBottom],
  );

  useEffect(() => {
    if (messages.length === 0) return;

    const isSessionSwitch = prevSessionIdForScrollRef.current !== activeSessionId;
    prevSessionIdForScrollRef.current = activeSessionId;

    return scrollMessagesToBottom(isSessionSwitch ? 'smooth' : 'auto');
  }, [activeSessionId, messages, scrollMessagesToBottom]);

  const handleCitationClick = useCallback((messageCitations: Citation[], index?: number) => {
    setCitations(messageCitations);
    setHighlightedCitationIndex(index);
    setShowCitations(true);
  }, []);

  const handleCreateSession = () => {
    const newSession: ChatSession = {
      id: `sess-${Date.now()}`,
      chat_id: 'chat-1',
      name: '新会话',
      messages: [],
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInput('');
    resetCitationState();
    message.success('已创建新会话');
  };

  const handleClearSession = (sessionId: string) => {
    const newSession: ChatSession = {
      id: `sess-${Date.now()}`,
      chat_id: 'chat-1',
      name: '新会话',
      messages: [],
      create_time: new Date().toISOString(),
      update_time: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev.filter((item) => item.id !== sessionId)]);
    setActiveSessionId(newSession.id);
    setInput('');
    resetCitationState();
    message.success('会话内容已清空');
  };

  const handleDeleteSession = (sessionId: string) => {
    const remaining = sessions.filter((item) => item.id !== sessionId);
    setSessions(remaining);
    if (activeSessionId === sessionId) {
      setActiveSessionId(remaining[0]?.id);
      setInput('');
      resetCitationState();
    }
    message.success('会话已删除');
  };

  const handleSelectSession = (sessionId: string) => {
    if (sessionId === activeSessionId) return;
    setActiveSessionId(sessionId);
    setInput('');
    resetCitationState();
  };

  return (
    <div className={classNames('chat-session-layout-demo-block14', styles['chat-session-layout-demo-block14'])}>
      <SessionSidebar
        title={mockChatAssistants[0]?.name ?? '制度问答助手'}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={handleSelectSession}
        onCreateSession={handleCreateSession}
        onClearSession={handleClearSession}
        onDeleteSession={handleDeleteSession}
      />
      <div className={classNames('chat-session-layout-demo-block15', styles['chat-session-layout-demo-block15'])}>
        <VirtualScrollbar
          ref={scrollContainerRef}
          wrapperClassName={classNames('chat-session-layout-demo-media', styles['chat-session-layout-demo-media'])}
          className={classNames('chat-session-layout-demo-block16', styles['chat-session-layout-demo-block16'])}
        >
          {messages.length === 0 ? (
            <div className={classNames('chat-session-layout-demo-block17', styles['chat-session-layout-demo-block17'])}>
              选择或新建会话后开始对话
            </div>
          ) : (
            <div ref={messagesContentRef}>
              {messages.map((item) => (
                <MessageItem
                  key={item.id}
                  message={item}
                  onCitationClick={
                    item.citations && item.citations.length > 0 ? handleCitationClick : undefined
                  }
                />
              ))}
            </div>
          )}
        </VirtualScrollbar>
        <ChatInput value={input} loading={false} onChange={setInput} onSend={() => setInput('')} />
      </div>

      {showCitations && (
        <div className={classNames('chat-session-layout-demo-block18', styles['chat-session-layout-demo-block18'])}>
          <CitationPanel
            citations={citations}
            highlightedIndex={highlightedCitationIndex}
            onClose={() => setShowCitations(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatSessionLayoutDemo;
