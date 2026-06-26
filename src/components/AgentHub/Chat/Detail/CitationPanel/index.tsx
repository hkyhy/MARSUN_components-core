import { VirtualScrollbar } from '@/components/VirtualScrollbar';
import { ChevronDown, X } from '@/components/Icons';
import type { Citation } from '@/components/AgentHub/types';
import { Button, Empty } from 'antd';
import classNames from 'classnames';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { formatCitationMeta, resolveCitationTitle } from '../../utils';
import CitationContent from '../CitationContent';
import styles from './style.module.scss';

export interface CitationPanelProps {
  citations: Citation[];
  highlightedIndex?: number;
  onClose?: () => void;
}

interface CitationItemProps {
  citation: Citation;
  index: number;
  highlighted?: boolean;
  expanded: boolean;
  onToggle: () => void;
  itemRef?: (el: HTMLElement | null) => void;
}

const CitationItem: React.FC<CitationItemProps> = ({
  citation,
  index,
  highlighted,
  expanded,
  onToggle,
  itemRef,
}) => {
  const meta = formatCitationMeta(citation);
  const hasContent = Boolean(citation.content);
  const title = resolveCitationTitle(citation, index);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!hasContent) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    },
    [hasContent, onToggle],
  );

  return (
    <article
      ref={itemRef}
      className={classNames(
        'citation-panel-citation-item',
        styles['citation-panel-citation-item'],
        highlighted && 'citation-panel-citation-item-highlighted',
        highlighted && styles['citation-panel-citation-item-highlighted'],
      )}
    >
      {highlighted && (
        <span
          className={classNames(
            'citation-panel-citation-item-marker',
            styles['citation-panel-citation-item-marker'],
            'bg-primary',
          )}
          aria-hidden
        />
      )}

      <div
        className={classNames(
          'citation-panel-citation-item-body',
          styles['citation-panel-citation-item-body'],
        )}
      >
        <span
          className={classNames(
            'citation-panel-citation-item-index',
            styles['citation-panel-citation-item-index'],
            highlighted ? 'citation-item-index-highlighted' : 'citation-item-index-default',
            highlighted
              ? styles['citation-panel-citation-item-index-highlighted']
              : styles['citation-panel-citation-item-index-default'],
          )}
        >
          {index + 1}
        </span>

        <div
          className={classNames(
            'citation-panel-citation-item-content',
            styles['citation-panel-citation-item-content'],
          )}
        >
          <div
            role={hasContent ? 'button' : undefined}
            tabIndex={hasContent ? 0 : undefined}
            aria-expanded={hasContent ? expanded : undefined}
            onClick={hasContent ? onToggle : undefined}
            onKeyDown={handleKeyDown}
            className={classNames(
              'citation-panel-citation-item-header',
              styles['citation-panel-citation-item-header'],
              hasContent && 'citation-panel-citation-item-header-interactive',
              hasContent && styles['citation-panel-citation-item-header-interactive'],
            )}
          >
            <div
              className={classNames(
                'citation-panel-citation-item-header-main',
                styles['citation-panel-citation-item-header-main'],
              )}
            >
              <h4
                className={classNames(
                  'citation-panel-citation-item-title',
                  styles['citation-panel-citation-item-title'],
                )}
                title={title}
              >
                {title}
              </h4>
              {meta && (
                <p
                  className={classNames(
                    'citation-panel-citation-item-meta',
                    styles['citation-panel-citation-item-meta'],
                  )}
                >
                  {meta}
                </p>
              )}
            </div>

            {hasContent && (
              <ChevronDown
                className={classNames(
                  'citation-panel-citation-item-chevron',
                  styles['citation-panel-citation-item-chevron'],
                  expanded && 'citation-panel-citation-item-chevron-expanded',
                  expanded && styles['citation-panel-citation-item-chevron-expanded'],
                )}
                aria-hidden
              />
            )}
          </div>

          {expanded && citation.content && (
            <blockquote
              className={classNames(
                'citation-panel-citation-item-quote',
                styles['citation-panel-citation-item-quote'],
              )}
            >
              <CitationContent content={citation.content} />
            </blockquote>
          )}
        </div>
      </div>
    </article>
  );
};

const CitationPanel: React.FC<CitationPanelProps> = ({ citations, highlightedIndex, onClose }) => {
  const [expandedSet, setExpandedSet] = useState<Set<number>>(() => new Set());
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (highlightedIndex === undefined || highlightedIndex < 0) return;
    setExpandedSet((prev) => new Set(prev).add(highlightedIndex));
    const el = itemRefs.current[highlightedIndex];
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, [highlightedIndex, citations]);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  return (
    <div
      className={classNames(
        'citation-panel-citation-panel',
        styles['citation-panel-citation-panel'],
      )}
    >
      <header className={classNames('citation-panel-header', styles['citation-panel-header'])}>
        <h3 className={classNames('citation-panel-title', styles['citation-panel-title'])}>
          引用来源
        </h3>
        <div
          className={classNames(
            'citation-panel-header-actions',
            styles['citation-panel-header-actions'],
          )}
        >
          {citations.length > 0 && (
            <span className={classNames('citation-panel-count', styles['citation-panel-count'])}>
              {citations.length}
            </span>
          )}
          {onClose && (
            <Button
              type="text"
              icon={
                <X
                  className={classNames(
                    'citation-panel-citation-summary-icon',
                    styles['citation-panel-citation-summary-icon'],
                  )}
                />
              }
              size="small"
              onClick={onClose}
              className={classNames('citation-panel-close-btn', styles['citation-panel-close-btn'])}
            />
          )}
        </div>
      </header>

      {citations.length === 0 ? (
        <div className={classNames('citation-panel-empty', styles['citation-panel-empty'])}>
          <Empty description="暂无引用来源" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : (
        <VirtualScrollbar
          wrapperClassName={classNames('citation-panel-empty', styles['citation-panel-empty'])}
        >
          {citations.map((c, i) => (
            <React.Fragment key={c.id ?? `${c.doc_id ?? 'cite'}-${i}`}>
              {i > 0 && (
                <div
                  className={classNames('citation-panel-divider', styles['citation-panel-divider'])}
                  role="separator"
                />
              )}
              <CitationItem
                citation={c}
                index={i}
                highlighted={highlightedIndex === i}
                expanded={expandedSet.has(i)}
                onToggle={() => toggleExpanded(i)}
                itemRef={(el) => {
                  itemRefs.current[i] = el;
                }}
              />
            </React.Fragment>
          ))}
        </VirtualScrollbar>
      )}
    </div>
  );
};

export default CitationPanel;
