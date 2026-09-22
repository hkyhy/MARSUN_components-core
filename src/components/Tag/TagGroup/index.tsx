import { Tooltip } from 'antd';
import React from 'react';
import classNames from 'classnames';
import SemanticTag, { SEMANTIC_COLORS, type SemanticColor } from '../SemanticTag';
import styles from './style.module.scss';

export interface TagGroupItem {
  key: React.Key;
  label: React.ReactNode;
  /** 语义色；未传用 group 默认色 */
  color?: SemanticColor | string;
  /** 选中态反白（SemanticTag selected） */
  selected?: boolean;
  /** 单项禁用点击 */
  disabled?: boolean;
  /** 悬停提示（有值时包 Tooltip） */
  title?: React.ReactNode;
}

export interface TagGroupProps {
  items?: TagGroupItem[];
  /** 无项时占位；传 null 不渲染 */
  empty?: React.ReactNode;
  className?: string;
  /** 点击某一项；有回调时默认可点（cursor:pointer） */
  onItemClick?: (item: TagGroupItem) => void;
  /** 未指定 color 的项默认色 */
  color?: SemanticColor | string;
}

/** 可交互标签组：按项着色 / selected / onItemClick / title（与展示截断型 Tags 分工） */
const TagGroup: React.FC<TagGroupProps> = ({
  items,
  empty = null,
  className,
  onItemClick,
  color = SEMANTIC_COLORS.DEFAULT,
}) => {
  if (!items?.length) {
    return empty != null ? <>{empty}</> : null;
  }

  const clickable = typeof onItemClick === 'function';

  return (
    <div className={classNames('tag-group-list', styles['tag-group-list'], className)}>
      {items.map((item) => {
        const canClick = clickable && !item.disabled;
        const tag = (
          <SemanticTag
            color={item.color ?? color}
            selected={item.selected}
            style={canClick ? { cursor: 'pointer' } : undefined}
            onClick={canClick ? () => onItemClick?.(item) : undefined}
          >
            {item.label}
          </SemanticTag>
        );
        if (item.title == null || item.title === '') {
          return <React.Fragment key={item.key}>{tag}</React.Fragment>;
        }
        return (
          <Tooltip key={item.key} title={item.title}>
            <span className={classNames('tag-group-item-wrap', styles['tag-group-item-wrap'])}>
              {tag}
            </span>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default TagGroup;
