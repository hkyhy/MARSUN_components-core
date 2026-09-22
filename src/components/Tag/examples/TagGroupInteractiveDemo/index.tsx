import { SEMANTIC_COLORS, TagGroup, type TagGroupItem } from '@/components';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import styles from './style.module.scss';

const OPTIONS: Array<{ key: string; label: string; alert?: boolean; count?: number }> = [
  { key: 'roller', label: '皮辊', alert: true, count: 3 },
  { key: 'apron', label: '皮圈' },
  { key: 'bearing', label: '轴承', alert: true },
  { key: 'spindle', label: '锭子' },
];

/** TagGroup：按项着色 + selected + onItemClick；同名 ×N + title Tooltip */
const TagGroupInteractiveDemo: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string>('roller');

  const items: TagGroupItem[] = useMemo(
    () =>
      OPTIONS.map((opt) => ({
        key: opt.key,
        label: opt.count && opt.count > 1 ? `${opt.label} ×${opt.count}` : opt.label,
        color: opt.alert ? SEMANTIC_COLORS.WARNING : SEMANTIC_COLORS.DEFAULT,
        selected: activeKey === opt.key,
        title: opt.count && opt.count > 1 ? `共 ${opt.count} 个物理槽位` : undefined,
      })),
    [activeKey],
  );

  return (
    <div
      className={classNames(
        'tag-group-interactive-demo-root',
        styles['tag-group-interactive-demo-root'],
      )}
    >
      <TagGroup items={items} onItemClick={(item) => setActiveKey(String(item.key))} />
      <p className={styles.hint}>
        当前选中：
        <strong>{OPTIONS.find((o) => o.key === activeKey)?.label}</strong>
        {' · '}预警项 WARNING，选中反白。
      </p>
    </div>
  );
};

export default TagGroupInteractiveDemo;
