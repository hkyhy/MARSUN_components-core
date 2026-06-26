import { StatCard, StatCardList } from '@/components';
import React from 'react';
import { MOCK_LARGE_STAT_ITEMS, MOCK_STAT_ITEMS } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const StatCardDemo: React.FC = () => (
  <div className={classNames('stat-card-demo-wrapper', styles['stat-card-demo-wrapper'])}>
    <h4 className={classNames('stat-card-demo-inner', styles['stat-card-demo-inner'])}>单个卡片</h4>
    <StatCard title="总文件数" value={128} />

    <h4 className={classNames('stat-card-demo-inner', styles['stat-card-demo-inner'])}>卡片列表</h4>
    <StatCardList items={MOCK_STAT_ITEMS} />

    <h4 className={classNames('stat-card-demo-inner', styles['stat-card-demo-inner'])}>大数值卡片</h4>
    <StatCardList items={MOCK_LARGE_STAT_ITEMS} />
  </div>
);

export default StatCardDemo;
