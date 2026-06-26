import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { prepareCitationContent, sanitizeCitationHtml } from '../../utils';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface CitationContentProps {
  content: string;
}

const CitationContent: React.FC<CitationContentProps> = ({ content }) => {
  const prepared = useMemo(() => prepareCitationContent(content), [content]);

  if (!prepared.body) return null;

  if (prepared.isHtml) {
    return (
      <div
        className={classNames('citation-content-citation-rich-content', styles['citation-content-citation-rich-content'])}
        dangerouslySetInnerHTML={{ __html: sanitizeCitationHtml(prepared.body) }}
      />
    );
  }

  return (
    <div className={classNames('markdown-preview', classNames('citation-content-footer', styles['citation-content-footer']))}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{prepared.body}</ReactMarkdown>
    </div>
  );
};

export default CitationContent;
