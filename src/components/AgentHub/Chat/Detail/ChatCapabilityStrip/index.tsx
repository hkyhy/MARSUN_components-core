import { ChevronDown, ChevronUp } from '@/components/Icons';
import classNames from 'classnames';
import { useMemo, type ReactNode } from 'react';
import styles from './style.module.scss';

export type ChatCapabilityItem = {
  id: string;
  label: string;
  examples: readonly string[];
};

export type ChatCapabilityStripProps = {
  capabilities: ReadonlyArray<ChatCapabilityItem>;
  expandedId: string | null;
  onExpandedChange: (id: string | null) => void;
  onSelectExample: (text: string) => void;
  disabled?: boolean;
  groupLabel?: string;
  groupHelp?: ReactNode;
  /** 展开区提示后缀，默认「点击即问」；展示为 `{label} · {examplesHint}` */
  examplesHint?: string;
  className?: string;
};

const ChatCapabilityStrip: React.FC<ChatCapabilityStripProps> = ({
  capabilities,
  expandedId,
  onExpandedChange,
  onSelectExample,
  disabled = false,
  groupLabel = '已开放',
  groupHelp,
  examplesHint = '点击即问',
  className,
}) => {
  const expanded = useMemo(
    () => capabilities.find((c) => c.id === expandedId) ?? null,
    [capabilities, expandedId],
  );

  if (!capabilities.length) return null;

  return (
    <div
      className={classNames(
        'chat-capability-strip-backdrop',
        styles['chat-capability-strip-backdrop'],
        !expanded && styles['chat-capability-strip-backdrop--collapsed'],
        className,
      )}
      aria-label={groupLabel}
    >
      <div className={classNames('chat-capability-strip', styles['chat-capability-strip'])}>
        <div
          className={classNames('chat-capability-strip-row', styles['chat-capability-strip-row'])}
        >
          <span
            className={classNames(
              'chat-capability-strip-group-label',
              styles['chat-capability-strip-group-label'],
            )}
          >
            {groupLabel}
            {groupHelp}
          </span>
          <div
            className={classNames(
              'chat-capability-strip-tags',
              styles['chat-capability-strip-tags'],
            )}
          >
            {capabilities.map((c) => {
              const active = expandedId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={classNames(
                    'chat-capability-strip-tag',
                    styles['chat-capability-strip-tag'],
                    active && styles['chat-capability-strip-tag--active'],
                  )}
                  aria-expanded={active}
                  aria-controls={`chat-capability-examples-${c.id}`}
                  onClick={() => onExpandedChange(active ? null : c.id)}
                >
                  {c.label}
                  {active ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </button>
              );
            })}
          </div>
        </div>
        {expanded ? (
          <div
            id={`chat-capability-examples-${expanded.id}`}
            className={classNames(
              'chat-capability-strip-examples',
              styles['chat-capability-strip-examples'],
            )}
            aria-label={`${expanded.label}提问样例`}
          >
            <div
              className={classNames(
                'chat-capability-strip-examples-hint',
                styles['chat-capability-strip-examples-hint'],
              )}
            >
              {expanded.label} · {examplesHint}
              <span
                className={classNames(
                  'chat-capability-strip-count',
                  styles['chat-capability-strip-count'],
                )}
              >
                {expanded.examples.length} 条
              </span>
            </div>
            <div
              className={classNames(
                'chat-capability-strip-chips',
                styles['chat-capability-strip-chips'],
              )}
            >
              {expanded.examples.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={classNames(
                    'chat-capability-strip-chip',
                    styles['chat-capability-strip-chip'],
                  )}
                  disabled={disabled}
                  onClick={() => onSelectExample(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ChatCapabilityStrip;
