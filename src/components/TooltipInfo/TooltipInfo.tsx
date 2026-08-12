import type { TooltipProps } from 'antd';
import { Tooltip } from 'antd';
import React from 'react';
import type { DescriptionItem } from '../Descriptions/CommonDescriptions';
import CommonDescriptions from '../Descriptions/CommonDescriptions';
import './style.module.scss';

/** Tooltip 展示形态：descriptions=结构化详情（默认）；note=标题+描述分层 */
export type TooltipInfoType = 'descriptions' | 'note';

/** note 形态内容：标题（粗体）+ 描述（次级色） */
export interface TooltipInfoNote {
  title: React.ReactNode;
  description: React.ReactNode;
}

export interface TooltipInfoProps extends Pick<
  TooltipProps,
  'placement' | 'mouseEnterDelay' | 'mouseLeaveDelay' | 'open' | 'onOpenChange'
> {
  /** 展示形态，默认 descriptions */
  type?: TooltipInfoType;
  /** type='descriptions' 的详情项（默认形态） */
  content?: DescriptionItem[];
  /** type='note' 的标题与描述 */
  note?: TooltipInfoNote;
  children: React.ReactNode;
  /** CommonDescriptions 列数，默认 1（仅 descriptions 形态） */
  column?: number;
  /** 为 true 时不展示 Tooltip；descriptions 形态下 content 为空也不展示 */
  hidden?: boolean;
  /** 气泡最小宽度，默认 descriptions 220 / note 240 */
  minWidth?: number;
  /** 气泡最大宽度，默认 descriptions 320 / note 380 */
  maxWidth?: number;
  /** @deprecated 使用 classNames.root */
  overlayClassName?: string;
  /** @deprecated 使用 styles.root */
  overlayStyle?: React.CSSProperties;
}

/** Tooltip 详情展示：descriptions 形态用 CommonDescriptions；note 形态用标题+描述分层 */
const TooltipInfo: React.FC<TooltipInfoProps> = ({
  type = 'descriptions',
  content,
  note,
  children,
  column = 1,
  hidden = false,
  minWidth,
  maxWidth,
  placement = 'top',
  overlayClassName,
  overlayStyle,
  mouseEnterDelay = 0.3,
  ...rest
}) => {
  const isNote = type === 'note';
  const empty = isNote ? !note : !content || content.length === 0;
  if (hidden || empty) {
    return <>{children}</>;
  }

  const minW = minWidth ?? (isNote ? 240 : 220);
  const maxW = maxWidth ?? (isNote ? 380 : 320);

  const title = isNote ? (
    <div className="tooltip-info-note">
      <div className="tooltip-info-note-title">{note!.title}</div>
      <div className="tooltip-info-note-desc">{note!.description}</div>
    </div>
  ) : (
    // bordered=false：antd Descriptions 改用 dl 布局而非 table，避免 table-layout:fixed
    // 在 max-content 气泡根下循环宽度塌陷，长文才能在 maxWidth 处正常换行
    <CommonDescriptions content={content!} column={column} size="small" bordered={false} />
  );

  return (
    <Tooltip
      placement={placement}
      mouseEnterDelay={mouseEnterDelay}
      destroyOnHidden
      classNames={{ root: ['tooltip-info-overlay', overlayClassName].filter(Boolean).join(' ') }}
      styles={{
        root: {
          // 覆盖 antd 默认 width:max-content，给气泡确定的最小宽度，避免子元素循环塌陷
          width: 'auto',
          minWidth: minW,
          maxWidth: maxW,
        },
        container: {
          boxSizing: 'border-box',
          minWidth: minW,
          maxWidth: maxW,
          padding: '8px 12px',
          background: 'var(--tooltip-info-bg, var(--bg-color-white, #ffffff))',
          color: 'var(--tooltip-info-color, var(--font-color, #222222))',
          boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)',
          ...overlayStyle,
        },
      }}
      getPopupContainer={() => document.body}
      title={title}
      {...rest}
    >
      {children}
    </Tooltip>
  );
};

export default TooltipInfo;
