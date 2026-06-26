import { VirtualScrollbar } from '@/components/VirtualScrollbar';
import classNames from 'classnames';
import React from 'react';
import styles from './style.module.scss';

const items = Array.from({ length: 40 }, (_, index) => ({
  id: index + 1,
  title: `列表项 ${index + 1}`,
  description: '覆盖式虚拟滚动条不占布局宽度，悬停或滚动时显示 thumb。',
}));

const VirtualScrollbarBasicDemo: React.FC = () => (
  <div className={classNames('virtual-scrollbar-basic-demo-row', styles['virtual-scrollbar-basic-demo-row'])}>
    <div>
      <div className={classNames('virtual-scrollbar-basic-demo-col', styles['virtual-scrollbar-basic-demo-col'])}>
        纵向滚动
      </div>
      <VirtualScrollbar
        wrapperClassName={classNames('virtual-scrollbar-basic-demo-wrap', styles['virtual-scrollbar-basic-demo-wrap'])}
        className={classNames('virtual-scrollbar-basic-demo-panel', styles['virtual-scrollbar-basic-demo-panel'])}
      >
        <div className={classNames('virtual-scrollbar-basic-demo-card', styles['virtual-scrollbar-basic-demo-card'])}>
          {items.map((item) => (
            <div
              key={item.id}
              className={classNames('virtual-scrollbar-basic-demo-item', styles['virtual-scrollbar-basic-demo-item'])}
            >
              <div className={classNames('virtual-scrollbar-basic-demo-link', styles['virtual-scrollbar-basic-demo-link'])}>
                {item.title}
              </div>
              <div className={classNames('virtual-scrollbar-basic-demo-label', styles['virtual-scrollbar-basic-demo-label'])}>
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </VirtualScrollbar>
    </div>

    <div>
      <div className={classNames('virtual-scrollbar-basic-demo-col', styles['virtual-scrollbar-basic-demo-col'])}>
        双向滚动
      </div>
      <VirtualScrollbar
        direction="both"
        wrapperClassName={classNames('virtual-scrollbar-basic-demo-wrap', styles['virtual-scrollbar-basic-demo-wrap'])}
        className={classNames('virtual-scrollbar-basic-demo-value', styles['virtual-scrollbar-basic-demo-value'])}
      >
        <div className={classNames('virtual-scrollbar-basic-demo-meta', styles['virtual-scrollbar-basic-demo-meta'])}>
          {items.slice(0, 12).map((item) => (
            <div
              key={item.id}
              className={classNames('virtual-scrollbar-basic-demo-icon', styles['virtual-scrollbar-basic-demo-icon'])}
            >
              {item.title} — 这是一段较长的横向内容，用于演示水平滚动条同样不占布局宽度
            </div>
          ))}
        </div>
      </VirtualScrollbar>
    </div>
  </div>
);

export default VirtualScrollbarBasicDemo;
