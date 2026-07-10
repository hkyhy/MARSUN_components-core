import { Empty } from '@/components';
import classNames from 'classnames';
import React from 'react';
import styles from './style.module.scss';

const EmptyDemo: React.FC = () => (
  <div className={classNames('empty-demo-root', styles['empty-demo-root'])}>
    <section className={classNames('empty-demo-item', styles['empty-demo-item'])}>
      <h4>默认图标 + 描述</h4>
      <Empty description="暂无文档" />
    </section>
    <section className={classNames('empty-demo-item', styles['empty-demo-item'])}>
      <h4>简图 + 描述</h4>
      <Empty iconType="simple" description="暂无历史对话" />
    </section>
    <section className={classNames('empty-demo-item', styles['empty-demo-item'])}>
      <h4>无图标 + 描述</h4>
      <Empty showIcon={false} description="选择左侧条目预览详情" />
    </section>
    <section className={classNames('empty-demo-item', styles['empty-demo-item'])}>
      <h4>仅图标</h4>
      <Empty iconType="simple" />
    </section>
  </div>
);

export default EmptyDemo;
