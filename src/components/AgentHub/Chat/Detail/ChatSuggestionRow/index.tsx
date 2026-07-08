import React from 'react';
import classNames from 'classnames';
import styles from './style.module.scss';

export interface ChatSuggestionRowProps {
  suggestions: string[];
  onSelect: (text: string) => void;
  visible?: boolean;
  className?: string;
}

const ChatSuggestionRow: React.FC<ChatSuggestionRowProps> = ({
  suggestions,
  onSelect,
  visible = true,
  className,
}) => {
  if (!visible || !suggestions.length) return null;

  return (
    <div className={classNames('chat-suggestion-row', styles['chat-suggestion-row'], className)}>
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          className={classNames('chat-suggestion-chip', styles['chat-suggestion-chip'])}
          title={text}
          onClick={() => onSelect(text)}
        >
          {text}
        </button>
      ))}
    </div>
  );
};

export default ChatSuggestionRow;
