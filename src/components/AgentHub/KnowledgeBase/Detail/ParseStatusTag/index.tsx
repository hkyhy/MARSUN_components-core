import { SemanticTag } from '@/components';
import { Loader2 } from '@/components/Icons';
import { Spin } from 'antd';
import React from 'react';
import { PARSE_STATUS_CONFIG } from '../../constants';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface ParseStatusTagProps {
  status?: string;
}

const ParseStatusTag: React.FC<ParseStatusTagProps> = ({ status }) => {
  const config = PARSE_STATUS_CONFIG[status ?? 'UNSTART'] ?? PARSE_STATUS_CONFIG['UNSTART']!;

  return (
    <SemanticTag color={config!.color}>
      {config!.spinning && <Spin indicator={<Loader2 />} size="small" className={classNames('parse-status-tag-container', styles['parse-status-tag-container'])} />}
      {config!.label}
    </SemanticTag>
  );
};

export default ParseStatusTag;
