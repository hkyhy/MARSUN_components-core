import classNames from 'classnames';
import type { ReactNode } from 'react';
import styles from './style.module.scss';

export type ContentCardProps = {
  children: ReactNode;
  className?: string;
  /** 去掉内边距（适合嵌套 Tabs / Table） */
  noPadding?: boolean;
  /** 无 border / shadow / radius，用于模块 workarea 扁平容器 */
  flat?: boolean;
};

/**
 * 主内容卡片容器。模块 workarea 扁平布局传 `flat`（可加 `noPadding`）。
 */
const ContentCard: React.FC<ContentCardProps> = ({ children, className, noPadding, flat }) => (
  <section
    className={classNames(
      'marsun-content-card',
      styles['marsun-content-card'],
      noPadding && styles['marsun-content-card--no-padding'],
      flat && styles['marsun-content-card--flat'],
      className,
    )}
  >
    {children}
  </section>
);

export default ContentCard;
