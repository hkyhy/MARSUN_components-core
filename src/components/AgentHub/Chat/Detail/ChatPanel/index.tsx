import type { ChatMessage } from '@/components/AgentHub/types';
import { VirtualScrollbar } from '@/components/VirtualScrollbar';
import { Button } from 'antd';
import React, { useRef, type ReactNode } from 'react';
import classNames from 'classnames';
import { useAutoScrollToBottom } from '../../hooks';
import ChatInput from '../ChatInput';
import type { ChatInputProps } from '../ChatInput';
import ChatSuggestionRow from '../ChatSuggestionRow';
import MessageItem from '../MessageItem';
import type { MessageItemProps } from '../MessageItem';
import styles from './style.module.scss';

export interface ChatPanelProps {
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  headerActions?: ReactNode;
  headerExtra?: ReactNode;
  beforeInput?: ReactNode;

  showSuggestions?: boolean;
  suggestions?: string[];
  onSuggestionClick?: (text: string) => void;

  messages: ChatMessage[];
  showEmptyHint?: boolean;
  emptyPlaceholder?: string;
  onCitationClick?: MessageItemProps['onCitationClick'];
  onEditMessage?: MessageItemProps['onEditMessage'];
  onResendMessage?: MessageItemProps['onResendMessage'];
  editDisabled?: boolean;

  inputValue: string;
  inputLoading?: boolean;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onStop?: ChatInputProps['onStop'];
  inputPlaceholder?: string;
  showInput?: boolean;

  className?: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  title,
  subtitle,
  showHeader = true,
  showCloseButton = false,
  onClose,
  headerActions,
  headerExtra,
  beforeInput,
  showSuggestions = false,
  suggestions = [],
  onSuggestionClick,
  messages,
  showEmptyHint = true,
  emptyPlaceholder = '点击上方建议，或直接输入问题',
  onCitationClick,
  onEditMessage,
  onResendMessage,
  editDisabled,
  inputValue,
  inputLoading = false,
  onInputChange,
  onSend,
  onStop,
  inputPlaceholder,
  showInput = true,
  className,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesContentRef = useRef<HTMLDivElement>(null);

  const { handleScroll } = useAutoScrollToBottom(scrollContainerRef, messagesContentRef, {
    enabled: messages.length > 0,
    trigger: messages,
  });

  const showSuggestionRow =
    showSuggestions && suggestions.length > 0 && typeof onSuggestionClick === 'function';

  return (
    <div className={classNames('chat-panel', styles['chat-panel'], className)}>
      {showHeader ? (
        <div className={classNames('chat-panel-head', styles['chat-panel-head'])}>
          <div className={styles['chat-panel-head-main']}>
            <div>
              {title ? <strong className={styles['chat-panel-title']}>{title}</strong> : null}
              {subtitle ? <span className={styles['chat-panel-subtitle']}>{subtitle}</span> : null}
            </div>
            {headerActions || (showCloseButton && onClose) ? (
              <div className={styles['chat-panel-head-actions']}>
                {headerActions}
                {showCloseButton && onClose ? (
                  <Button type="link" size="small" onClick={onClose}>
                    收起
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
          {headerExtra ? (
            <div className={styles['chat-panel-head-extra']}>{headerExtra}</div>
          ) : null}
        </div>
      ) : null}

      {showSuggestionRow ? (
        <ChatSuggestionRow suggestions={suggestions} onSelect={onSuggestionClick} />
      ) : null}

      <VirtualScrollbar
        className={classNames('chat-panel-messages', styles['chat-panel-messages'])}
        wrapperClassName={styles['chat-panel-messages-wrapper']}
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <div ref={messagesContentRef}>
          {messages.length === 0 && showEmptyHint ? (
            <p className={styles['chat-panel-empty']}>{emptyPlaceholder}</p>
          ) : (
            messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                onCitationClick={onCitationClick}
                onEditMessage={onEditMessage}
                onResendMessage={onResendMessage}
                editDisabled={editDisabled || inputLoading}
              />
            ))
          )}
        </div>
      </VirtualScrollbar>

      {beforeInput ? <div className={styles['chat-panel-before-input']}>{beforeInput}</div> : null}

      {showInput ? (
        <div className={styles['chat-panel-input']}>
          <ChatInput
            embedded
            value={inputValue}
            loading={inputLoading}
            onChange={onInputChange}
            onSend={onSend}
            onStop={onStop}
            placeholder={inputPlaceholder}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ChatPanel;
