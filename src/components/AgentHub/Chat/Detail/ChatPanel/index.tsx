import type { ChatMessage } from '@/components/AgentHub/types';
import { VirtualScrollbar } from '@/components/VirtualScrollbar';
import { Button } from 'antd';
import React, { useCallback, useMemo, useRef, type ReactNode } from 'react';
import classNames from 'classnames';
import { useAutoScrollToBottom } from '../../hooks';
import ChatFollowUpSuggestions from '../ChatFollowUpSuggestions';
import ChatInput from '../ChatInput';
import type { ChatInputProps } from '../ChatInput';
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

  /** API 返回的推荐问/追问列表 */
  followUpItems?: string[];
  /** 无用户消息且无 followUpItems 时的兜底推荐 */
  starterItems?: string[];
  /** 点击推荐项（完全自定义，优先于 onSendMessage） */
  onFollowUpSelect?: (text: string) => void;
  /** 点击推荐项直接发送（推荐问/追问默认行为） */
  onSendMessage?: (text: string) => void;
  /** true 时隐藏推荐区（如会话加载、发送中） */
  followUpLoading?: boolean;
  followUpDefaultExpanded?: boolean;
  starterTitle?: string;
  followUpTitle?: string;

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
  followUpItems,
  starterItems,
  onFollowUpSelect,
  onSendMessage,
  followUpLoading = false,
  followUpDefaultExpanded = true,
  starterTitle = '推荐问',
  followUpTitle = '推荐追问',
  messages,
  showEmptyHint,
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

  const hasUserMessages = messages.some((message) => message.role === 'user');

  const effectiveFollowUpItems = useMemo(() => {
    if (followUpItems?.length) return followUpItems;
    if (!hasUserMessages && starterItems?.length) return starterItems;
    return [];
  }, [followUpItems, hasUserMessages, starterItems]);

  const showFollowUp =
    effectiveFollowUpItems.length > 0 &&
    !followUpLoading &&
    (typeof onFollowUpSelect === 'function' || typeof onSendMessage === 'function');

  const followUpDisplayTitle = hasUserMessages ? followUpTitle : starterTitle;

  const effectiveShowEmptyHint = showEmptyHint ?? (!showFollowUp && !followUpLoading);

  const handleFollowUpSelect = useCallback(
    (text: string) => {
      if (onFollowUpSelect) {
        onFollowUpSelect(text);
        return;
      }
      onSendMessage?.(text);
    },
    [onFollowUpSelect, onSendMessage],
  );

  const beforeInputContent =
    beforeInput || showFollowUp ? (
      <>
        {beforeInput}
        {showFollowUp ? (
          <ChatFollowUpSuggestions
            className={styles['chat-panel-follow-up']}
            items={effectiveFollowUpItems}
            title={followUpDisplayTitle}
            defaultExpanded={followUpDefaultExpanded}
            onSelect={handleFollowUpSelect}
          />
        ) : null}
      </>
    ) : null;

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

      <VirtualScrollbar
        className={classNames('chat-panel-messages', styles['chat-panel-messages'])}
        wrapperClassName={styles['chat-panel-messages-wrapper']}
        onScroll={handleScroll}
        ref={scrollContainerRef}
      >
        <div ref={messagesContentRef}>
          {messages.length === 0 && effectiveShowEmptyHint ? (
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

      {beforeInputContent ? (
        <div className={styles['chat-panel-before-input']}>{beforeInputContent}</div>
      ) : null}

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
