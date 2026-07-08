import classNames from 'classnames';
import React, { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import styles from './style.module.scss';

export interface ChatAgentFabProps {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  fabLabel?: ReactNode;
  openAriaLabel?: string;
  closeAriaLabel?: string;
  panelAriaLabel?: string;
  closeOnClickOutside?: boolean;
  className?: string;
  fabClassName?: string;
  panelClassName?: string;
  panelBodyClassName?: string;
  /** 展开引用侧栏等场景下加宽面板 */
  panelExpanded?: boolean;
  /** 全屏高度（宽度仍由 panelExpanded 控制） */
  panelFullscreen?: boolean;
  offsetRight?: number | string;
  offsetBottom?: number | string;
  zIndex?: number;
}

const ChatAgentFab: React.FC<ChatAgentFabProps> = ({
  children,
  open = false,
  onOpenChange,
  fabLabel = 'AI+',
  openAriaLabel = '打开 AI 助手',
  closeAriaLabel = '收起 AI 助手',
  panelAriaLabel,
  closeOnClickOutside = true,
  className,
  fabClassName,
  panelClassName,
  panelBodyClassName,
  panelExpanded = false,
  panelFullscreen = false,
  offsetRight = 24,
  offsetBottom = 24,
  zIndex = 1100,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !closeOnClickOutside) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      onOpenChange?.(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [closeOnClickOutside, onOpenChange, open]);

  const rootStyle: CSSProperties = {
    right: offsetRight,
    bottom: offsetBottom,
    zIndex,
  };

  return (
    <div
      ref={rootRef}
      className={classNames('chat-agent-fab', styles['chat-agent-fab'], className)}
      style={rootStyle}
    >
      {open ? (
        <div
          className={classNames(
            'chat-agent-fab-panel',
            styles['chat-agent-fab-panel'],
            panelExpanded && styles['chat-agent-fab-panel--expanded'],
            panelFullscreen && styles['chat-agent-fab-panel--fullscreen'],
            panelClassName,
          )}
          role="dialog"
          aria-label={panelAriaLabel}
        >
          <div
            className={classNames(
              'chat-agent-fab-panel-body',
              styles['chat-agent-fab-panel-body'],
              panelExpanded && styles['chat-agent-fab-panel-body--expanded'],
              panelBodyClassName,
            )}
          >
            {children}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className={classNames(
          'chat-agent-fab-button',
          styles['chat-agent-fab-button'],
          open && styles['chat-agent-fab-button--active'],
          fabClassName,
        )}
        aria-label={open ? closeAriaLabel : openAriaLabel}
        aria-expanded={open}
        onClick={() => onOpenChange?.(!open)}
      >
        <span className={classNames('chat-agent-fab-icon', styles['chat-agent-fab-icon'])}>
          {fabLabel}
        </span>
      </button>
    </div>
  );
};

export default ChatAgentFab;
