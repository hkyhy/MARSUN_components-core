import ThinkingSection from '@/components/AgentHub/Chat/Detail/ThinkingSection';
import { Switch, Typography } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import styles from './style.module.scss';

const { Text } = Typography;

const THINKING_TEXT =
  '用户询问年假天数，需要从制度文档中检索工龄与休假天数对应关系，并整理为条目化回答。';

const ThinkingSectionBasicDemo: React.FC = () => {
  const [isThinking, setIsThinking] = useState(true);

  return (
    <div className={classNames('thinking-section-basic-demo-root', styles['thinking-section-basic-demo-root'])}>
      <div className={classNames('thinking-section-basic-demo-toolbar', styles['thinking-section-basic-demo-toolbar'])}>
        <Text type="secondary">思考中</Text>
        <Switch size="small" checked={isThinking} onChange={setIsThinking} />
      </div>
      <ThinkingSection thinking={THINKING_TEXT} isThinking={isThinking} />
    </div>
  );
};

export default ThinkingSectionBasicDemo;
