import { Spin } from 'antd';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import styles from './style.module.scss';

export type PageSpinProps = {
  spinning: boolean;
  children: ReactNode;
  className?: string;
  /** 高度随内容撑开（不抢 flex:1），配合 ModulePageShell fillHeight={false} */
  naturalHeight?: boolean;
};

/** 模块页 body 区整页 Spin：参与 flex 高度链，遮罩 Filter + 主工作区 */
const PageSpin: React.FC<PageSpinProps> = ({
  spinning,
  children,
  className,
  naturalHeight = false,
}) => (
  <Spin
    spinning={spinning}
    classNames={{
      root: classNames(
        styles['page-spin'],
        naturalHeight && styles['page-spin--natural'],
        className,
      ),
    }}
  >
    {children}
  </Spin>
);

export default PageSpin;
