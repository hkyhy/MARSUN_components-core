import type { TooltipProps } from 'antd';
import { Tooltip } from 'antd';
import React from 'react';
import type { DescriptionItem } from '../Descriptions/CommonDescriptions';
import CommonDescriptions from '../Descriptions/CommonDescriptions';
import './style.module.scss';

export interface TooltipInfoProps extends Pick<
  TooltipProps,
  'placement' | 'mouseEnterDelay' | 'mouseLeaveDelay'
> {
  /** 详情描述项，内部使用 CommonDescriptions 渲染 */
  content: DescriptionItem[];
  children: React.ReactNode;
  /** CommonDescriptions 列数，默认 1 */
  column?: number;
  /** 为 true 或 content 为空时不展示 Tooltip */
  hidden?: boolean;
  /** @deprecated 使用 classNames.root */
  overlayClassName?: string;
  /** @deprecated 使用 styles.root */
  overlayStyle?: React.CSSProperties;
}

/** Tooltip 详情展示，内部统一使用 CommonDescriptions */
const TooltipInfo: React.FC<TooltipInfoProps> = ({
  content,
  children,
  column = 1,
  hidden = false,
  placement = 'top',
  overlayClassName,
  overlayStyle,
  mouseEnterDelay = 0.3,
  ...rest
}) => {
  if (hidden || content.length === 0) {
    return <>{children}</>;
  }

  return (
    <Tooltip
      placement={placement}
      mouseEnterDelay={mouseEnterDelay}
      destroyOnHidden
      classNames={{ root: ['tooltip-info-overlay', overlayClassName].filter(Boolean).join(' ') }}
      styles={{
        container: {
          maxWidth: 360,
          padding: '8px 12px',
          background: 'var(--tooltip-info-bg, var(--bg-color-white, #ffffff))',
          color: 'var(--tooltip-info-color, var(--font-color, #222222))',
          boxShadow:
            '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)',
          ...overlayStyle,
        },
      }}
      getPopupContainer={() => document.body}
      title={<CommonDescriptions content={content} column={column} size="small" />}
      {...rest}
    >
      {children}
    </Tooltip>
  );
};

export default TooltipInfo;
