import { StatCardList } from '@/components';
import React from 'react';
import { MOCK_LARGE_STAT_ITEMS, MOCK_STAT_ITEMS } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

/** StatCardList 列表布局示例 */
const StatCardListDemo: React.FC = () => (
  <div className={classNames('stat-card-list-demo-wrapper', styles['stat-card-list-demo-wrapper'])}>
    {/* 基础列表 */}
    <div>
      <h4 className={classNames('stat-card-list-demo-header', styles['stat-card-list-demo-header'])}>自动网格列表</h4>
      <StatCardList items={MOCK_STAT_ITEMS} />
    </div>

    {/* 大数值列表 */}
    <div>
      <h4 className={classNames('stat-card-list-demo-header', styles['stat-card-list-demo-header'])}>大数值数据</h4>
      <StatCardList items={MOCK_LARGE_STAT_ITEMS} />
    </div>

    {/* 隐藏某项 */}
    <div>
      <h4 className={classNames('stat-card-list-demo-header', styles['stat-card-list-demo-header'])}>隐藏部分项 (hidden)</h4>
      <StatCardList
        items={[
          { title: '显示项', value: 100 },
          { title: '隐藏项', value: 0, hidden: true },
          { title: '另一显示项', value: 50 },
        ]}
      />
    </div>
  </div>
);

export default StatCardListDemo;
