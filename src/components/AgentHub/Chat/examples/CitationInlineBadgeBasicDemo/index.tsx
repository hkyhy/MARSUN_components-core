import CitationInlineBadge from '@/components/AgentHub/Chat/Detail/CitationInlineBadge';
import { Typography } from 'antd';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

const { Text } = Typography;

const CitationInlineBadgeBasicDemo: React.FC = () => (
  <div className={classNames('citation-inline-badge-basic-demo-block19', styles['citation-inline-badge-basic-demo-block19'])}>
    <Text>根据企业制度文档</Text>
    <CitationInlineBadge number={1} />
    <CitationInlineBadge number={2} />
    <Text>，正式员工年假标准为 5-15 天。</Text>
  </div>
);

export default CitationInlineBadgeBasicDemo;
