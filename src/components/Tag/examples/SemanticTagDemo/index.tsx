import { SEMANTIC_COLORS, SemanticTag } from '@/components';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

const SemanticTagDemo: React.FC = () => (
  <div className={classNames('semantic-tag-demo-container', styles['semantic-tag-demo-container'])}>
    {Object.entries(SEMANTIC_COLORS).map(([key, color]) => (
      <SemanticTag key={key} color={color}>
        {key}
      </SemanticTag>
    ))}
  </div>
);

export default SemanticTagDemo;
