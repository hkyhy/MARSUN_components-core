import { Pause, Send } from '@/components/Icons';
import { Button, Input } from 'antd';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface ChatInputProps {
  value: string;
  loading: boolean;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop?: () => void;
  placeholder?: string;
  /** 嵌入 ChatPanel 时去掉外层 border/padding，避免与 chat-panel-input 重复 */
  embedded?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  loading,
  onChange,
  onSend,
  onStop,
  placeholder = '输入问题… Enter 发送，Shift+Enter 换行',
  embedded = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div
      className={classNames(
        'chat-input-root',
        styles['chat-input-root'],
        embedded && styles['chat-input-root--embedded'],
      )}
    >
      <div className={classNames('chat-input-container', styles['chat-input-container'])}>
        <Input.TextArea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoSize={{ minRows: 1, maxRows: 5 }}
          disabled={loading}
          variant="borderless"
          className={classNames('chat-input-wrapper', styles['chat-input-wrapper'])}
        />

        {loading ? (
          <Button
            type="primary"
            danger
            icon={<Pause />}
            onClick={onStop}
            aria-label="停止生成"
            className={classNames('chat-input-inner', styles['chat-input-inner'])}
          />
        ) : (
          <Button
            type="primary"
            icon={<Send />}
            onClick={onSend}
            disabled={!value.trim()}
            className={classNames('chat-input-inner', styles['chat-input-inner'])}
          />
        )}
      </div>

      <div className={classNames('chat-input-header', styles['chat-input-header'])}>
        <span className={classNames('chat-input-body', styles['chat-input-body'])}>
          Enter 发送 · Shift+Enter 换行
        </span>
        {value.length > 0 && (
          <span className={classNames('chat-input-body', styles['chat-input-body'])}>
            {value.length} 字
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
