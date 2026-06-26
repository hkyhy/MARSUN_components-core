import type { Citation } from '@/components/AgentHub/types';
import React, { useEffect, useRef, useState } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';
import CitationMarkdownContent from '../CitationMarkdownContent';

export interface ThinkingSectionProps {
  thinking: string;
  isThinking?: boolean;
  isTyping?: boolean;
  citations?: Citation[];
  citationSourceContent?: string;
  onCitationClick?: (citations: Citation[], index?: number) => void;
  deferMermaid?: boolean;
}

const ChevronIcon: React.FC<{ expanded: boolean }> = ({ expanded }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    className={classNames('thinking-section-thinking-chevron', styles['thinking-section-thinking-chevron'],
      expanded && 'thinking-section-thinking-chevron-expanded',
      expanded && styles['thinking-section-thinking-chevron-expanded'],
    )}
    aria-hidden
  >
    <path
      d="M3 4.5L6 7.5L9 4.5"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ThinkingSection: React.FC<ThinkingSectionProps> = ({
  thinking,
  isThinking,
  isTyping,
  citations = [],
  citationSourceContent = '',
  onCitationClick,
  deferMermaid = false,
}) => {
  const [expanded, setExpanded] = useState(!!isThinking);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const thinkingScrollRef = useRef<HTMLDivElement>(null);
  const thinkingContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isThinking) {
      setExpanded(true);
      if (startRef.current === null) {
        startRef.current = Date.now();
      }
    } else if (startRef.current !== null) {
      setElapsed(Math.max(1, Math.round((Date.now() - startRef.current) / 1000)));
      startRef.current = null;
    }
  }, [isThinking]);

  useEffect(() => {
    if (!isThinking) return;
    const timer = window.setInterval(() => {
      if (startRef.current !== null) {
        setElapsed(Math.max(1, Math.round((Date.now() - startRef.current) / 1000)));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isThinking]);

  useEffect(() => {
    if (!isThinking || !expanded) return;
    const scrollEl = thinkingScrollRef.current;
    const contentEl = thinkingContentRef.current;
    if (!scrollEl || !contentEl) return;

    const scrollToEnd = () => {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    };

    scrollToEnd();
    const observer = new ResizeObserver(scrollToEnd);
    observer.observe(contentEl);
    return () => observer.disconnect();
  }, [isThinking, isTyping, expanded, thinking]);

  if (!thinking && !isThinking) return null;

  const showThinkingCursor = (isThinking || isTyping) && thinking.trim().length > 0;
  const statusLabel = isThinking ? '思考中' : elapsed > 0 ? `已思考 ${elapsed}s` : '思考过程';

  const handleToggle = () => setExpanded((prev) => !prev);

  return (
    <div className={classNames('thinking-section-thinking-section', styles['thinking-section-thinking-section'])}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={classNames('group', 'thinking-toggle', styles['thinking-section-thinking-toggle'])}
      >
        <span className={classNames('thinking-section-thinking-toggle-icon-wrap', styles['thinking-section-thinking-toggle-icon-wrap'])}>
          {isThinking ? (
            <>
              <span className={classNames('thinking-section-thinking-ping-ring', styles['thinking-section-thinking-ping-ring'])} />
              <span className={classNames('thinking-section-thinking-dot-active', styles['thinking-section-thinking-dot-active'])} />
            </>
          ) : (
            <span className={classNames('thinking-section-thinking-dot-idle', styles['thinking-section-thinking-dot-idle'])} />
          )}
        </span>

        <span
          className={classNames('thinking-section-thinking-status-label', styles['thinking-section-thinking-status-label'],
            isThinking && 'thinking-section-thinking-status-label-active',
            isThinking && styles['thinking-section-thinking-status-label-active'],
          )}
        >
          {statusLabel}
        </span>

        <ChevronIcon expanded={expanded} />
      </div>

      <div
        className={classNames('thinking-section-thinking-expand-grid', styles['thinking-section-thinking-expand-grid'],
          expanded
            ? classNames('thinking-section-thinking-expand-grid-open', styles['thinking-section-thinking-expand-grid-open'])
            : classNames('thinking-section-thinking-expand-grid-closed', styles['thinking-section-thinking-expand-grid-closed']),
        )}
      >
        <div className={classNames('thinking-section-thinking-expand-inner', styles['thinking-section-thinking-expand-inner'])}>
          {thinking.trim() ? (
            <div ref={thinkingScrollRef} className={classNames('thinking-section-thinking-scroll-area', styles['thinking-section-thinking-scroll-area'])}>
              <div ref={thinkingContentRef} className={classNames('thinking-section-thinking-content', styles['thinking-section-thinking-content'])}>
                <CitationMarkdownContent
                  content={thinking}
                  citations={citations}
                  citationSourceContent={citationSourceContent}
                  onCitationClick={onCitationClick}
                  deferMermaid={deferMermaid}
                />
                {showThinkingCursor && <span className={classNames('thinking-section-thinking-cursor', styles['thinking-section-thinking-cursor'])} />}
              </div>
            </div>
          ) : isThinking ? (
            <div className={classNames('thinking-section-thinking-empty-cursor-wrap', styles['thinking-section-thinking-empty-cursor-wrap'])}>
              <span className={classNames('thinking-section-thinking-empty-cursor', styles['thinking-section-thinking-empty-cursor'])} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ThinkingSection;
