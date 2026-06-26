import type { ChatSession } from '@/components/AgentHub/types';
import SessionSidebar from '@/components/AgentHub/Chat/List/SessionSidebar';
import { message } from 'antd';
import React, { useState } from 'react';
import { mockChatAssistants, mockChatSessions } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const SessionSidebarBasicDemo: React.FC = () => {
  const [sessions, setSessions] = useState(mockChatSessions);
  const [activeSessionId, setActiveSessionId] = useState(mockChatSessions[0]?.id);

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
    message.success('会话内容已清空');
  };

  const handleDeleteSession = (sessionId: string) => {
    const remaining = sessions.filter((item) => item.id !== sessionId);
    setSessions(remaining);
    if (activeSessionId === sessionId) {
      setActiveSessionId(remaining[0]?.id);
    }
    message.success('会话已删除');
  };

  return (
    <div className={classNames('session-sidebar-basic-demo-block24', styles['session-sidebar-basic-demo-block24'])}>
      <SessionSidebar
        title={mockChatAssistants[0]?.name ?? '制度问答助手'}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={(sessionId) => {
          setActiveSessionId(sessionId);
          message.info('已切换会话');
        }}
        onCreateSession={handleCreateSession}
        onClearSession={handleClearSession}
        onDeleteSession={handleDeleteSession}
      />
      <div className={classNames('session-sidebar-basic-demo-block25', styles['session-sidebar-basic-demo-block25'])}>
        消息区域占位
      </div>
    </div>
  );
};

export default SessionSidebarBasicDemo;
