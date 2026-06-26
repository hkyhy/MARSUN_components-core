import type { Citation } from '@/components/AgentHub/types';
import React, { Suspense, useCallback, useMemo } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  citationDisplayNumber,
  citationIdToIndex,
  extractCitationIdsFromContent,
  injectCitationMarkdownLinks,
  normalizeAssistantMarkdown,
  normalizeDisplayText,
  parseCitationLinkHref,
} from '../../utils';
import CitationInlineBadge from '../CitationInlineBadge';
import styles from './style.module.scss';
import classNames from 'classnames';

const MermaidBlock = React.lazy(() => import('../MermaidBlock'));

export interface CitationMarkdownContentProps {
  content: string;
  citations: Citation[];
  citationSourceContent: string;
  onCitationClick?: (citations: Citation[], index?: number) => void;
  className?: string;
  deferMermaid?: boolean;
}

const CitationMarkdownContent: React.FC<CitationMarkdownContentProps> = ({
  content,
  citations,
  citationSourceContent,
  onCitationClick,
  className,
  deferMermaid = false,
}) => {
  const markdownContent = useMemo(() => {
    const text = normalizeDisplayText(normalizeAssistantMarkdown(content));
    const hasMarkers = extractCitationIdsFromContent(text).length > 0;
    return hasMarkers || citations.length > 0 ? injectCitationMarkdownLinks(text) : text;
  }, [content, citations.length]);

  const handleCitationBadgeClick = useCallback(
    (citationId: number) => {
      if (!citations.length || !onCitationClick) return;
      onCitationClick(
        citations,
        citationIdToIndex(citationId, citations.length, citationSourceContent),
      );
    },
    [citations, citationSourceContent, onCitationClick],
  );

  const markdownComponents = useMemo<Components>(
    () => ({
      code: ({ className, children, ...props }) => {
        const lang = /language-(\w+)/.exec(className || '')?.[1];
        const source = String(children).replace(/\n$/, '');
        if (lang === 'mermaid') {
          return (
            <Suspense
              fallback={
                <div className={classNames('mermaid-block', 'mermaid-block--loading', classNames('citation-markdown-content-col', styles['citation-markdown-content-col']))}>
                  图表加载中…
                </div>
              }
            >
              <MermaidBlock chart={source} enabled={!deferMermaid} />
            </Suspense>
          );
        }
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
      a: ({ href, children }) => {
        const citationId = parseCitationLinkHref(href);
        if (citationId !== null) {
          const displayNumber = citationDisplayNumber(
            citationId,
            citations.length,
            citationSourceContent,
          );
          return (
            <CitationInlineBadge
              number={displayNumber}
              onClick={() => handleCitationBadgeClick(citationId)}
            />
          );
        }
        return (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary">
            {children}
          </a>
        );
      },
    }),
    [citations.length, citationSourceContent, deferMermaid, handleCitationBadgeClick],
  );

  if (!markdownContent.trim()) return null;

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

export default CitationMarkdownContent;
