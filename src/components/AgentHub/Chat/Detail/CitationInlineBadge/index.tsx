import styles from './style.module.scss';
import classNames from 'classnames';
import React from 'react';

export interface CitationInlineBadgeProps {
  number: number;
  onClick?: () => void;
}

const CitationInlineBadge: React.FC<CitationInlineBadgeProps> = ({ number, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames('text-primary', 'citation-inline-badge-row', styles['citation-inline-badge-row'])}
      title={`查看引用来源 ${number}`}
    >
      {number}
    </button>
  );
};

export default CitationInlineBadge;
