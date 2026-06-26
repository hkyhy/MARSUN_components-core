import KnowledgeCard from '@/components/AgentHub/KnowledgeBase/List/KnowledgeCard';
import { message } from 'antd';
import React from 'react';
import { mockDatasets } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const KnowledgeCardBasicDemo: React.FC = () => (
  <div className={classNames('knowledge-card-basic-demo-desc', styles['knowledge-card-basic-demo-desc'])}>
    {mockDatasets.map((dataset) => (
      <KnowledgeCard
        key={dataset.id}
        dataset={dataset}
        onView={(d) => message.info(`查看文档：${d.name}`)}
        onUpload={(d) => message.info(`上传文档：${d.name}`)}
        onEdit={(d) => message.info(`编辑：${d.name}`)}
        onDelete={(d) => message.success(`已删除：${d.name}`)}
      />
    ))}
  </div>
);

export default KnowledgeCardBasicDemo;
