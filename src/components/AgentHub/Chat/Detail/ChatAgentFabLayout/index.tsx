import classNames from 'classnames';
import React, { type ReactNode } from 'react';
import styles from './style.module.scss';

export interface ChatAgentFabLayoutProps {
  /** ChatPanel 等主对话区 */
  main: ReactNode;
  /** 引用侧栏（通常为 CitationPanel） */
  citationAside?: ReactNode;
  className?: string;
  mainClassName?: string;
  citationAsideClassName?: string;
}

/**
 * ChatAgentFab 内横向布局：主对话区 + 可选引用侧栏。
 * 配合 ChatAgentFab.panelExpanded 在侧栏打开时加宽面板。
 */
const ChatAgentFabLayout: React.FC<ChatAgentFabLayoutProps> = ({
  main,
  citationAside,
  className,
  mainClassName,
  citationAsideClassName,
}) => (
  <div className={classNames('chat-agent-fab-layout', styles['chat-agent-fab-layout'], className)}>
    <div
      className={classNames(
        'chat-agent-fab-layout-main',
        styles['chat-agent-fab-layout-main'],
        mainClassName,
      )}
    >
      {main}
    </div>
    {citationAside ? (
      <div
        className={classNames(
          'chat-agent-fab-layout-citation-aside',
          styles['chat-agent-fab-layout-citation-aside'],
          citationAsideClassName,
        )}
      >
        {citationAside}
      </div>
    ) : null}
  </div>
);

export default ChatAgentFabLayout;
