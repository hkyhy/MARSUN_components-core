import { Button, Tag } from 'antd';
import classNames from 'classnames';
import React, { type ReactNode } from 'react';
import { formatDispositionTriggerText, type DispositionAlertContext } from './types';
import styles from './style.module.scss';

export type {
  DispositionAlertContext,
  DispositionAlertKind,
  DispositionAlertLevelSpec,
  DispositionAlertLevelCatalog,
} from './types';
export {
  formatDispositionTriggerText,
  getDispositionAlertLevel,
  buildDispositionAlertContext,
} from './types';
export { default as DispositionAlertLevelLegend } from './LevelLegend';
export type { DispositionAlertLevelLegendProps } from './LevelLegend';

export type AlertDispositionPanelProps = {
  open: boolean;
  context: DispositionAlertContext | null;
  children: ReactNode;
  className?: string;
  /** 手动收起（换机台仍由业务 hook resetKey 清空） */
  onCollapse?: () => void;
};

/**
 * 详情处置展开壳：触发上下文条 + 分域 DispositionBar（children）。
 * 收起 → null；扁平布局，禁双层 card。不绑业务 API / EP / reveal 状态。
 * 等级展示靠 label + 可选 tone 色标，与圆点/方点等形状解耦。
 */
const AlertDispositionPanel: React.FC<AlertDispositionPanelProps> = ({
  open,
  context,
  children,
  className,
  onCollapse,
}) => {
  if (!open || !context) return null;

  return (
    <div
      className={classNames(
        'marsun-alert-disposition-panel',
        styles['marsun-alert-disposition-panel'],
        className,
      )}
      data-testid="alert-disposition-panel"
    >
      <div
        className={classNames(
          'marsun-alert-disposition-trigger-row',
          styles['marsun-alert-disposition-trigger-row'],
        )}
      >
        <div
          className={classNames(
            'marsun-alert-disposition-trigger',
            styles['marsun-alert-disposition-trigger'],
          )}
          data-testid="alert-disposition-trigger"
        >
          {context.tone ? (
            <Tag
              color={context.tone}
              className={styles['marsun-alert-disposition-tone']}
              data-testid="alert-disposition-tone"
            >
              {context.label}
            </Tag>
          ) : null}
          <span>{formatDispositionTriggerText(context)}</span>
        </div>
        {onCollapse ? (
          <Button
            type="link"
            size="small"
            className={classNames(
              'marsun-alert-disposition-collapse',
              styles['marsun-alert-disposition-collapse'],
            )}
            onClick={onCollapse}
            data-testid="alert-disposition-collapse"
          >
            收起
          </Button>
        ) : null}
      </div>
      {children}
    </div>
  );
};

export default AlertDispositionPanel;
