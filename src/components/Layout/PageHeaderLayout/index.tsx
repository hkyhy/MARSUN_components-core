import { ArrowLeft } from '@/components/Icons';
import { Button } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './style.module.scss';

export interface PageHeaderLayoutProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  /** 页面说明提示，显示在头部下方、内容区上方 */
  description?: React.ReactNode;
  children?: React.ReactNode;
}

/** 页面头部布局：返回按钮 + 标题 + 操作区 + 说明提示 + 内容 */
const PageHeaderLayout: React.FC<PageHeaderLayoutProps> = ({
  title,
  onBack,
  actions,
  description,
  children,
}) => (
  <div>
    <div className={classNames('page-header-layout-root', styles['page-header-layout-root'])}>
      <div
        className={classNames(
          'page-header-layout-container',
          styles['page-header-layout-container'],
        )}
      >
        {onBack && <Button type="text" icon={<ArrowLeft />} onClick={onBack} />}
        <h2
          className={classNames('page-header-layout-wrapper', styles['page-header-layout-wrapper'])}
        >
          {title}
        </h2>
      </div>
      <div>{actions}</div>
    </div>
    {description && (
      <div className={classNames('page-header-layout-inner', styles['page-header-layout-inner'])}>
        {description}
      </div>
    )}
    {children}
  </div>
);

export default PageHeaderLayout;
