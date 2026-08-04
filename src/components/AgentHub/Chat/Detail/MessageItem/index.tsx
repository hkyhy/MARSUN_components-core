import { BookOpen, Bot, User } from '@/components/Icons';
import type { ChatMessage, ChatWidget, Citation } from '@/components/AgentHub/types';
import ChatWidgetBlock from '@/components/AgentHub/Chat/Detail/ChatWidgetBlock';
import { message as antdMessage, Avatar, Typography } from 'antd';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTypewriter } from '../../hooks';
import { countUniqueCitedSources, normalizeDisplayText, parseAssistantContent } from '../../utils';
import CitationMarkdownContent from '../CitationMarkdownContent';
import MessageActions, {
  createAssistantMessageActions,
  createUserMessageActions,
} from '../MessageActions';
import ThinkingSection from '../ThinkingSection';
import styles from './style.module.scss';

const { Text } = Typography;

export interface MessageItemProps {
  message: ChatMessage;
  onCitationClick?: (citations: Citation[], index?: number) => void;
  onTypingChange?: (typing: boolean) => void;
  onEditMessage?: (messageId: string, content: string) => void;
  onResendMessage?: (content: string) => void;
  onMessageFeedback?: (messageId: string, thumbup: boolean) => void | Promise<void>;
  editDisabled?: boolean;
  feedbackDisabled?: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onCitationClick,
  onTypingChange,
  onEditMessage,
  onResendMessage,
  onMessageFeedback,
  editDisabled,
  feedbackDisabled,
}) => {
  const isUser = message.role === 'user';
  const [editOpen, setEditOpen] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [localThumbup, setLocalThumbup] = useState<boolean | null | undefined>(message.thumbup);
  const parsedContent = useMemo(
    () => parseAssistantContent(message.content, !!message.streaming),
    [message.content, message.streaming],
  );

  const shouldAnimateThinking = !!message.streaming && parsedContent.isThinking;
  const { displayed: displayedThinking, isTyping: isThinkingTyping } = useTypewriter(
    parsedContent.thinking,
    shouldAnimateThinking,
  );
  const thinkingToShow = parsedContent.isThinking ? displayedThinking : parsedContent.thinking;

  const { displayed: displayedContent, isTyping } = useTypewriter(
    parsedContent.answer,
    !!message.streaming,
  );

  const citations = useMemo(() => message.citations ?? [], [message.citations]);
  const messageWidgets = useMemo(
    () => (Array.isArray(message.widgets) ? (message.widgets as ChatWidget[]) : []),
    [message.widgets],
  );
  const citationSourceContent = useMemo(
    () => `${parsedContent.thinking}\n${parsedContent.answer}`,
    [parsedContent.thinking, parsedContent.answer],
  );
  const uniqueCitedCount = useMemo(
    () => countUniqueCitedSources(citationSourceContent, citations.length),
    [citationSourceContent, citations.length],
  );

  const citationSummaryLabel = useMemo(() => {
    if (citations.length === 0) return '';
    if (uniqueCitedCount > 0 && uniqueCitedCount < citations.length) {
      return `检索 ${citations.length} 个来源 · 正文引用 ${uniqueCitedCount} 处`;
    }
    return `引用了 ${citations.length} 个来源`;
  }, [citations.length, uniqueCitedCount]);

  const effectiveThinkingTyping = parsedContent.isThinking && isThinkingTyping;

  useEffect(() => {
    if (isUser) return;
    onTypingChange?.(isTyping || effectiveThinkingTyping);
  }, [isUser, isTyping, effectiveThinkingTyping, onTypingChange]);

  useEffect(() => {
    setLocalThumbup(message.thumbup);
  }, [message.id, message.thumbup]);

  const hasAnswerContent = normalizeDisplayText(displayedContent).trim().length > 0;
  const showWidgets = !isUser && messageWidgets.length > 0;
  const showAnswerCursor = (message.streaming || isTyping) && hasAnswerContent;
  const isContentTyping = isTyping || effectiveThinkingTyping;
  const deferMermaid = !!message.streaming || isContentTyping;

  const handleSummaryClick = useCallback(() => {
    if (!citations.length || !onCitationClick) return;
    onCitationClick(citations);
  }, [citations, onCitationClick]);

  const copyText = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const verifyClipboard = async () => {
      if (!navigator.clipboard?.readText) return null;
      try {
        return await navigator.clipboard.readText();
      } catch {
        return null;
      }
    };

    const copyWithClipboardApi = async () => {
      if (!navigator.clipboard) return false;

      if (typeof ClipboardItem !== 'undefined' && typeof navigator.clipboard.write === 'function') {
        try {
          const item = new ClipboardItem({
            'text/plain': Promise.resolve(new Blob([text], { type: 'text/plain' })),
          });
          await navigator.clipboard.write([item]);
          const got = await verifyClipboard();
          // got === null：无读权限，信任 write；空串则视为未写入
          if (got === null || got === text) return true;
          if (got === '') return false;
        } catch {
          /* fall through to writeText */
        }
      }

      if (typeof navigator.clipboard.writeText !== 'function') return false;
      await navigator.clipboard.writeText(text);
      const got = await verifyClipboard();
      if (got === '') return false;
      return got === null || got === text;
    };

    const copyWithSelection = () => {
      const el = document.createElement('div');
      el.textContent = text;
      el.setAttribute('contenteditable', 'true');
      el.style.cssText =
        'position:fixed;top:0;left:0;width:2px;height:2px;padding:0;margin:0;border:none;outline:none;opacity:0.01;overflow:hidden;z-index:2147483647;white-space:pre;user-select:text;-webkit-user-select:text;';
      document.body.appendChild(el);

      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      selection?.removeAllRanges();
      selection?.addRange(range);
      el.focus();

      let ok = false;
      try {
        ok = document.execCommand('copy');
      } finally {
        selection?.removeAllRanges();
        document.body.removeChild(el);
      }
      return ok;
    };

    try {
      if (await copyWithClipboardApi()) {
        antdMessage.success('已复制');
        return;
      }
    } catch {
      /* 继续 selection 回退 */
    }

    try {
      if (copyWithSelection()) {
        const got = await verifyClipboard();
        if (got === null || got === text) {
          antdMessage.success('已复制');
          return;
        }
      }
    } catch {
      /* fall through */
    }

    antdMessage.error('复制失败，请手动选择文本复制');
  }, []);

  const assistantCopyText = normalizeDisplayText(parsedContent.answer);
  const showAssistantActions =
    !isUser && !message.streaming && !isContentTyping && assistantCopyText.trim().length > 0;

  const handleEditCancel = useCallback(() => {
    setEditOpen(false);
    setEditValue(message.content);
  }, [message.content]);

  const handleEditConfirm = useCallback(() => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === message.content.trim() || !onEditMessage) return;
    onEditMessage(message.id, trimmed);
    setEditOpen(false);
  }, [editValue, message.content, message.id, onEditMessage]);

  const handleFeedback = useCallback(
    async (thumbup: boolean) => {
      if (feedbackSubmitting || feedbackDisabled) return;
      if (localThumbup === thumbup) return;

      if (onMessageFeedback) {
        setFeedbackSubmitting(true);
        try {
          await onMessageFeedback(message.id, thumbup);
          setLocalThumbup(thumbup);
        } catch {
          // 错误提示由上层处理
        } finally {
          setFeedbackSubmitting(false);
        }
        return;
      }

      setLocalThumbup(thumbup);
      antdMessage.success('感谢反馈');
    },
    [feedbackDisabled, feedbackSubmitting, localThumbup, message.id, onMessageFeedback],
  );

  const actionItems = isUser
    ? createUserMessageActions({
        onEdit: onEditMessage
          ? () => {
              setEditValue(message.content);
              setEditOpen(true);
            }
          : undefined,
        onCopy: () => copyText(message.content),
        onResend: onResendMessage ? () => onResendMessage(message.content) : undefined,
        editDisabled,
      })
    : createAssistantMessageActions({
        onLike: () => {
          void handleFeedback(true);
        },
        onDislike: () => {
          void handleFeedback(false);
        },
        onCopy: () => copyText(assistantCopyText),
        thumbup: localThumbup,
        feedbackDisabled: feedbackDisabled || feedbackSubmitting,
      });

  const editPopoverProps = onEditMessage
    ? {
        open: editOpen,
        value: editValue,
        originalContent: message.content,
        onOpenChange: (open: boolean) => {
          setEditOpen(open);
          if (!open) setEditValue(message.content);
        },
        onChange: setEditValue,
        onConfirm: handleEditConfirm,
        onCancel: handleEditCancel,
      }
    : undefined;

  const userMessageBubble = (
    <div
      className={classNames(
        'message-item-message-user-bubble',
        styles['message-item-message-user-bubble'],
        'bg-primary',
      )}
    >
      <span
        className={classNames(
          'message-item-message-user-bubble-text',
          styles['message-item-message-user-bubble-text'],
        )}
      >
        {message.content}
      </span>
    </div>
  );

  return (
    <div
      className={classNames(
        'group',
        'message-row',
        styles['message-item-message-row'],
        isUser && 'message-item-message-row-reverse',
        isUser && styles['message-item-message-row-reverse'],
      )}
    >
      <Avatar
        size={34}
        icon={isUser ? <User /> : <Bot />}
        className={classNames(
          'message-item-message-avatar',
          styles['message-item-message-avatar'],
          !isUser && 'message-item-message-avatar-assistant',
          !isUser && styles['message-item-message-avatar-assistant'],
        )}
        style={isUser ? {} : { color: 'var(--primary-color)' }}
      />

      <div
        className={classNames(
          'message-item-message-content',
          styles['message-item-message-content'],
          isUser
            ? classNames(
                'message-item-message-content-user',
                styles['message-item-message-content-user'],
              )
            : classNames(
                'message-item-message-content-assistant',
                styles['message-item-message-content-assistant'],
              ),
        )}
      >
        <div
          className={
            isUser
              ? undefined
              : classNames(
                  'message-item-message-assistant-bubble',
                  styles['message-item-message-assistant-bubble'],
                )
          }
        >
          {isUser ? (
            userMessageBubble
          ) : message.streaming &&
            !parsedContent.thinking &&
            !parsedContent.isThinking &&
            !hasAnswerContent &&
            !showWidgets ? (
            <div
              className={classNames(
                'message-item-message-loading-dots',
                styles['message-item-message-loading-dots'],
              )}
            >
              <span
                className={classNames(
                  'message-item-message-loading-dot',
                  styles['message-item-message-loading-dot'],
                )}
              />
              <span
                className={classNames(
                  'message-item-message-loading-dot',
                  styles['message-item-message-loading-dot'],
                )}
              />
              <span
                className={classNames(
                  'message-item-message-loading-dot',
                  styles['message-item-message-loading-dot'],
                )}
              />
            </div>
          ) : (
            <>
              {(parsedContent.thinking || parsedContent.isThinking) && (
                <ThinkingSection
                  thinking={thinkingToShow}
                  isThinking={parsedContent.isThinking}
                  isTyping={effectiveThinkingTyping}
                  citations={citations}
                  citationSourceContent={citationSourceContent}
                  onCitationClick={onCitationClick}
                  deferMermaid={deferMermaid}
                />
              )}
              {showWidgets ? (
                <ChatWidgetBlock
                  widgets={messageWidgets}
                  compact
                  leading
                  className={classNames(
                    (parsedContent.thinking || parsedContent.isThinking) &&
                      styles['message-item-message-widgets-after-thinking'],
                  )}
                />
              ) : null}
              {hasAnswerContent && (
                <div
                  className={classNames(
                    'markdown-preview',
                    'message-answer-markdown',
                    styles['message-item-message-answer-markdown'],
                    (parsedContent.thinking || parsedContent.isThinking) &&
                      'message-answer-markdown-spaced',
                    (parsedContent.thinking || parsedContent.isThinking) &&
                      styles['message-item-message-answer-markdown-spaced'],
                    showWidgets && styles['message-item-message-answer-markdown-after-widgets'],
                  )}
                >
                  <CitationMarkdownContent
                    content={displayedContent}
                    citations={citations}
                    citationSourceContent={citationSourceContent}
                    onCitationClick={onCitationClick}
                    deferMermaid={deferMermaid}
                  />
                  {showAnswerCursor && (
                    <span
                      className={classNames(
                        'message-item-message-typing-cursor',
                        styles['message-item-message-typing-cursor'],
                      )}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {(isUser || showAssistantActions) && (
          <MessageActions
            items={actionItems}
            align={isUser ? 'right' : 'left'}
            editPopover={editPopoverProps}
            actionsVisible={editOpen}
          />
        )}

        {!isUser && citations.length > 0 && !isContentTyping && (
          <button
            type="button"
            onClick={handleSummaryClick}
            className={classNames(
              'message-item-citation-summary-button',
              styles['message-item-citation-summary-button'],
            )}
          >
            <BookOpen
              className={classNames(
                'text-primary',
                'citation-summary-icon',
                styles['message-item-citation-summary-icon'],
              )}
            />
            <Text
              className={classNames(
                'text-primary',
                'citation-summary-text',
                styles['message-item-citation-summary-text'],
              )}
            >
              {citationSummaryLabel}
            </Text>
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
