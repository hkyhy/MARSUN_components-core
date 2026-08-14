import { Button } from 'antd';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import React from 'react';
import styles from './style.module.scss';

interface FilterPanelProps {
  children: ReactNode;
  onConfirm?: () => void;
  onReset?: () => void;
  confirmText?: string;
  width?: number;
  /** 移动端：按钮默认尺寸、面板全宽 */
  mobile?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  children,
  onConfirm,
  onReset,
  confirmText = '确定',
  width = 360,
  mobile = false,
}) => (
  <div
    style={mobile ? { width: '100%', maxWidth: '100%' } : { maxWidth: width, minWidth: '200px' }}
  >
    <div className={classNames('filter-panel-body', styles['filter-panel-body'])}>{children}</div>
    {(onConfirm || onReset) && (
      <div className={classNames('filter-panel-actions', styles['filter-panel-actions'])}>
        {onReset && (
          <Button size={mobile ? 'middle' : 'small'} onClick={onReset}>
            取消
          </Button>
        )}
        {onConfirm && (
          <Button size={mobile ? 'middle' : 'small'} type="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        )}
      </div>
    )}
  </div>
);

export default FilterPanel;
export type { FilterPanelProps };
