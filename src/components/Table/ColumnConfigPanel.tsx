import { useCallback, useMemo, useState, type DragEvent, type FC, type ReactNode } from 'react';
import { Button, Checkbox, Collapse, Empty, Input, Popover, Space, Tooltip } from 'antd';
import { ChevronDown, ChevronRight, Settings, Undo2 } from '../Icons';
import type { ColumnConfigPanelItem, TableColumnConfigItem } from './columnConfigTypes';
import { mergePanelWithConfig, panelItemsToConfig, splitVisibleHidden } from './columnConfigUtils';
import styles from './columnConfig.module.scss';

type ColumnConfigPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultItems: ColumnConfigPanelItem[];
  savedConfig: TableColumnConfigItem[] | null;
  onConfirm: (items: TableColumnConfigItem[]) => void | Promise<void>;
  children: ReactNode;
};

function flattenSearch(items: ColumnConfigPanelItem[], q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return items.some(
    (it) =>
      it.label.toLowerCase().includes(lower) ||
      it.id.toLowerCase().includes(lower) ||
      (it.children ? flattenSearch(it.children, q) : false),
  );
}

const DragList: FC<{
  items: ColumnConfigPanelItem[];
  search: string;
  onChange: (next: ColumnConfigPanelItem[]) => void;
  onToggle: (id: string, hidden: boolean) => void;
  depth?: number;
  collapsedIds: Set<string>;
  onToggleCollapse: (id: string) => void;
}> = ({ items, search, onChange, onToggle, depth = 0, collapsedIds, onToggleCollapse }) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const searching = Boolean(search.trim());

  const filtered = useMemo(() => {
    if (!search.trim()) return items.map((it, i) => ({ it, i }));
    return items.map((it, i) => ({ it, i })).filter(({ it }) => flattenSearch([it], search.trim()));
  }, [items, search]);

  const onDragStart = (e: DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const onDrop = (e: DragEvent, toIndex: number) => {
    e.preventDefault();
    const from = dragIndex ?? Number(e.dataTransfer.getData('text/plain'));
    setDragIndex(null);
    if (!Number.isFinite(from) || from === toIndex) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(toIndex, 0, moved);
    onChange(next);
  };

  if (!filtered.length) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无数据" />;
  }

  return (
    <ul className={styles.list} style={{ paddingLeft: depth ? 12 : 0 }}>
      {filtered.map(({ it, i }) => {
        const hasChildren = Boolean(it.children?.length);
        const expanded = searching || !collapsedIds.has(it.id);
        return (
          <li key={it.id} className={styles.listItem}>
            <div
              className={styles.row}
              draggable={!searching}
              onDragStart={(e) => onDragStart(e, i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, i)}
            >
              {hasChildren ? (
                <button
                  type="button"
                  className={styles.foldBtn}
                  aria-label={expanded ? '折叠' : '展开'}
                  aria-expanded={expanded}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollapse(it.id);
                  }}
                >
                  {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <span className={styles.foldSpacer} aria-hidden />
              )}
              <span className={styles.grip} aria-hidden>
                ⠿
              </span>
              <Checkbox checked={!it.hidden} onChange={(e) => onToggle(it.id, !e.target.checked)}>
                <span className={styles.label}>{it.label || it.id}</span>
              </Checkbox>
            </div>
            {hasChildren && expanded ? (
              <DragList
                items={it.children!}
                search={search}
                depth={depth + 1}
                collapsedIds={collapsedIds}
                onToggleCollapse={onToggleCollapse}
                onChange={(childNext) => {
                  const next = items.map((x) =>
                    x.id === it.id ? { ...x, children: childNext } : x,
                  );
                  onChange(next);
                }}
                onToggle={(cid, hidden) => {
                  const next = items.map((x) => {
                    if (x.id !== it.id || !x.children) return x;
                    const children = x.children.map((c) =>
                      c.id === cid
                        ? { ...c, hidden }
                        : c.children
                          ? {
                              ...c,
                              children: toggleDeep(c.children, cid, hidden),
                            }
                          : c,
                    );
                    const allHidden = children.every((c) => c.hidden);
                    return { ...x, children, hidden: allHidden ? true : hidden ? x.hidden : false };
                  });
                  onChange(next);
                }}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};

function toggleDeep(
  items: ColumnConfigPanelItem[],
  id: string,
  hidden: boolean,
): ColumnConfigPanelItem[] {
  return items.map((it) => {
    if (it.id === id) return { ...it, hidden };
    if (it.children) {
      const children = toggleDeep(it.children, id, hidden);
      return {
        ...it,
        children,
        hidden: children.every((c) => c.hidden) ? true : it.hidden && hidden,
      };
    }
    return it;
  });
}

function toggleInTree(
  items: ColumnConfigPanelItem[],
  id: string,
  hidden: boolean,
): ColumnConfigPanelItem[] {
  return items.map((it) => {
    if (it.id === id) {
      const children = it.children?.map((c) => setHiddenDeep(c, hidden));
      return { ...it, hidden, children };
    }
    if (it.children) {
      const children = toggleInTree(it.children, id, hidden);
      const allHidden = children.every((c) => c.hidden);
      return {
        ...it,
        children,
        hidden: allHidden ? true : !hidden && it.id !== id ? false : it.hidden,
      };
    }
    return it;
  });
}

function setHiddenDeep(item: ColumnConfigPanelItem, hidden: boolean): ColumnConfigPanelItem {
  return {
    ...item,
    hidden,
    children: item.children?.map((c) => setHiddenDeep(c, hidden)),
  };
}

/** 将显隐两区合并回完整顺序：visible 在前，hidden 在后（保持各自内部拖拽序） */
function mergeSections(
  visible: ColumnConfigPanelItem[],
  hidden: ColumnConfigPanelItem[],
): ColumnConfigPanelItem[] {
  return [...visible, ...hidden];
}

export const ColumnConfigPopover: FC<ColumnConfigPanelProps> = ({
  open,
  onOpenChange,
  defaultItems,
  savedConfig,
  onConfirm,
  children,
}) => {
  const [draft, setDraft] = useState<ColumnConfigPanelItem[]>([]);
  const [searchVisible, setSearchVisible] = useState('');
  const [searchHidden, setSearchHidden] = useState('');
  const [saving, setSaving] = useState(false);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());

  const syncDraft = useCallback(() => {
    setDraft(mergePanelWithConfig(defaultItems, savedConfig));
    setSearchVisible('');
    setSearchHidden('');
    setCollapsedIds(new Set());
  }, [defaultItems, savedConfig]);

  const handleOpenChange = (next: boolean) => {
    if (next) syncDraft();
    onOpenChange(next);
  };

  const { visible, hidden } = useMemo(() => splitVisibleHidden(draft), [draft]);

  const setVisibleList = (list: ColumnConfigPanelItem[]) => {
    setDraft(mergeSections(list, hidden));
  };
  const setHiddenList = (list: ColumnConfigPanelItem[]) => {
    setDraft(mergeSections(visible, list));
  };

  const onToggle = (id: string, nextHidden: boolean) => {
    setDraft((prev) => toggleInTree(prev, id, nextHidden));
  };

  const onToggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onReset = () => {
    setDraft(defaultItems.map((d) => ({ ...d, children: d.children?.map((c) => ({ ...c })) })));
    setCollapsedIds(new Set());
  };

  const onOk = async () => {
    setSaving(true);
    try {
      await onConfirm(panelItemsToConfig(draft));
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <div className={styles.panel} data-ui="table-column-config">
      <div className={styles.header}>
        <span className={styles.title}>编辑表格</span>
        <Tooltip title="恢复默认">
          <button type="button" className={styles.resetBtn} onClick={onReset} aria-label="恢复默认">
            <Undo2 size={16} />
          </button>
        </Tooltip>
      </div>
      <Collapse
        className={styles.collapse}
        defaultActiveKey={['visible', 'hidden']}
        ghost
        items={[
          {
            key: 'visible',
            label: '显示的信息',
            children: (
              <>
                <Input
                  allowClear
                  size="small"
                  className={styles.search}
                  placeholder="搜索"
                  value={searchVisible}
                  onChange={(e) => setSearchVisible(e.target.value)}
                />
                <DragList
                  items={visible}
                  search={searchVisible}
                  onChange={setVisibleList}
                  onToggle={onToggle}
                  collapsedIds={collapsedIds}
                  onToggleCollapse={onToggleCollapse}
                />
              </>
            ),
          },
          {
            key: 'hidden',
            label: '隐藏的信息',
            children: (
              <>
                <Input
                  allowClear
                  size="small"
                  className={styles.search}
                  placeholder="搜索"
                  value={searchHidden}
                  onChange={(e) => setSearchHidden(e.target.value)}
                />
                <DragList
                  items={hidden}
                  search={searchHidden}
                  onChange={setHiddenList}
                  onToggle={onToggle}
                  collapsedIds={collapsedIds}
                  onToggleCollapse={onToggleCollapse}
                />
              </>
            ),
          },
        ]}
      />
      <div className={styles.footer}>
        <Space>
          <Button size="small" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="primary" size="small" loading={saving} onClick={() => void onOk()}>
            确定
          </Button>
        </Space>
      </div>
    </div>
  );

  return (
    <Popover
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={handleOpenChange}
      content={content}
      overlayClassName={styles.overlay}
      arrow={false}
    >
      {children}
    </Popover>
  );
};

export function ColumnConfigTrigger({
  open,
  onOpenChange,
  defaultItems,
  savedConfig,
  onConfirm,
}: Omit<ColumnConfigPanelProps, 'children'>) {
  return (
    <ColumnConfigPopover
      open={open}
      onOpenChange={onOpenChange}
      defaultItems={defaultItems}
      savedConfig={savedConfig}
      onConfirm={onConfirm}
    >
      <button
        type="button"
        className={styles.gearBtn}
        aria-label="编辑表格"
        onClick={(e) => e.stopPropagation()}
      >
        <Settings size={14} />
      </button>
    </ColumnConfigPopover>
  );
}
