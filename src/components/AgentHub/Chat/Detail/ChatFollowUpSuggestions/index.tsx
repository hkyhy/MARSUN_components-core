import { ChevronDown, ChevronUp, MessageCircle } from '@/components/Icons';
import { VirtualScrollbar } from '@/components/VirtualScrollbar';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './style.module.scss';

export interface ChatFollowUpSuggestionsProps {
  items: string[];
  onSelect: (text: string) => void;
  title?: string;
  className?: string;
  /** 列表区最大高度，超出后纵向滚动 */
  maxListHeight?: number;
  /** 是否可折叠，默认 true */
  collapsible?: boolean;
  /** 初始展开状态 */
  defaultExpanded?: boolean;
}

const ChatFollowUpSuggestions: React.FC<ChatFollowUpSuggestionsProps> = ({
  items,
  onSelect,
  title = '推荐追问',
  className,
  maxListHeight = 132,
  collapsible = true,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!items.length) return null;

  const toggleExpanded = () => {
    if (!collapsible) return;
    setExpanded((prev) => !prev);
  };

  return (
    <div
      className={classNames(
        'chat-followup-suggestions',
        styles['chat-followup-suggestions'],
        className,
      )}
    >
      {title ? (
        <button
          type="button"
          className={classNames(
            styles['chat-followup-header'],
            collapsible && styles['chat-followup-header--collapsible'],
          )}
          onClick={toggleExpanded}
          aria-expanded={expanded}
          disabled={!collapsible}
        >
          <span className={styles['chat-followup-title']}>
            {title}
            <span className={styles['chat-followup-count']}>{items.length}</span>
          </span>
          {collapsible ? (
            expanded ? (
              <ChevronUp className={styles['chat-followup-toggle']} aria-hidden />
            ) : (
              <ChevronDown className={styles['chat-followup-toggle']} aria-hidden />
            )
          ) : null}
        </button>
      ) : null}

      {expanded ? (
        <VirtualScrollbar
          wrapperClassName={styles['chat-followup-list-scroll-wrapper']}
          style={{ maxHeight: maxListHeight }}
          className={styles['chat-followup-list-scroll']}
        >
          <div className={styles['chat-followup-list']}>
            {items.map((text, index) => (
              <button
                key={`${index}-${text.slice(0, 24)}`}
                type="button"
                className={styles['chat-followup-item']}
                title={text}
                onClick={() => onSelect(text)}
              >
                <MessageCircle className={styles['chat-followup-icon']} aria-hidden />
                <span className={styles['chat-followup-text']}>{text}</span>
              </button>
            ))}
          </div>
        </VirtualScrollbar>
      ) : null}
    </div>
  );
};

export default ChatFollowUpSuggestions;
