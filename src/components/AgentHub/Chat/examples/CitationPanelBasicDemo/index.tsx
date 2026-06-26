import CitationPanel from '@/components/AgentHub/Chat/Detail/CitationPanel';
import React, { useState } from 'react';
import { mockCitations } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const CitationPanelBasicDemo: React.FC = () => {
  const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(0);

  return (
    <div className={classNames('citation-panel-basic-demo-block20', styles['citation-panel-basic-demo-block20'])}>
      <CitationPanel
        citations={mockCitations}
        highlightedIndex={highlightedIndex}
        onClose={() => setHighlightedIndex(undefined)}
      />
    </div>
  );
};

export default CitationPanelBasicDemo;
