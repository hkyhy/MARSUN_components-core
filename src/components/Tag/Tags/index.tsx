import { Tooltip } from 'antd';
import React from 'react';
import SemanticTag, { SEMANTIC_COLORS, type SemanticColor } from '../SemanticTag';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface TagsProps {
  /** 标签列表 */
  tags?: string[];
  /** 最多展示的标签数量；未传或 tags 数量未超出时展示全部 */
  showLength?: number;
  /** 无标签时的占位，传 null 则不渲染 */
  empty?: React.ReactNode;
  className?: string;
  /** 标签颜色，默认 INFO */
  color?: SemanticColor | string;
}

const renderTags = (
  tagList: string[],
  options: {
    otherCount?: number;
    nowrap?: boolean;
    className?: string;
    color: SemanticColor | string;
  },
) => {
  const { otherCount = 0, nowrap = false, className, color } = options;
  const layoutClass = nowrap ? classNames('tags-tag-list-nowrap', styles['tags-tag-list-nowrap']) : undefined;

  return (
    <div className={classNames('tags-tag-list', styles['tags-tag-list'], layoutClass, className)}>
      {tagList.map((tag) => (
        <SemanticTag key={tag} color={color}>
          {tag}
        </SemanticTag>
      ))}
      {otherCount > 0 && <SemanticTag color={color}>+{otherCount}</SemanticTag>}
    </div>
  );
};

/** 通用标签列表（SemanticTag + showLength 截断） */
const Tags: React.FC<TagsProps> = ({
  tags,
  showLength,
  empty = '-',
  className,
  color = SEMANTIC_COLORS.INFO,
}) => {
  if (!tags?.length) {
    return empty != null ? <>{empty}</> : null;
  }

  const shouldTruncate = showLength != null && showLength > 0 && tags.length > showLength;

  if (!shouldTruncate) {
    return renderTags(tags, { className, color });
  }

  const visibleTags = tags.slice(0, showLength);
  const otherCount = tags.length - showLength;

  return (
    <Tooltip title={renderTags(tags, { className: classNames('tags-tag-list-tooltip', styles['tags-tag-list-tooltip']), color })}>
      {renderTags(visibleTags, { otherCount, nowrap: true, className, color })}
    </Tooltip>
  );
};

export default Tags;
