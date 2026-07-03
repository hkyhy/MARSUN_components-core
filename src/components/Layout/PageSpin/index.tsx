import { Spin } from 'antd';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import styles from './style.module.scss';

export type PageSpinProps = {
  spinning: boolean;
  children: ReactNode;
  className?: string;
};

/** 模块页 body 区整页 Spin：参与 flex 高度链，遮罩 Filter + 主工作区 */
const PageSpin: React.FC<PageSpinProps> = ({ spinning, children, className }) => (
  <Spin spinning={spinning} wrapperClassName={classNames(styles['page-spin'], className)}>
    {children}
  </Spin>
);

export default PageSpin;
