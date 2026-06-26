import { Check, ChevronDown, ChevronRight, X } from '@/components/Icons';
import { useMarsunFetch } from '@/provider';
import { useFetchData } from '@/hooks/useFetchData';
import { Checkbox, Input, Space } from 'antd';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FilterPopover from '../FilterPopover';
import type { BaseFilterProps } from '../types';
import { resolveFilterVisible } from '../types';
import { useFilterRegister } from '../useFilterState';
import styles from './style.module.scss';

const { Search } = Input;

export interface TreeFilterNode {
  id: string;
  name: string;
  children?: TreeFilterNode[];
}

export interface FilterTreeSelectProps extends BaseFilterProps {
  treeData?: TreeFilterNode[];
  fetchUrl?: string;
  fetchOptions?: RequestInit;
  transformData?: (raw: unknown) => TreeFilterNode[];
  enabled?: boolean;
  value?: string | string[] | undefined;
  onChange?: (value: string | string[] | undefined) => void;
  showSearch?: boolean;
  multiple?: boolean;
  /** 自定义节点展示标签（默认 name） */
  getNodeLabel?: (node: TreeFilterNode) => string;
}

interface FlatNode {
  id: string;
  name: string;
  depth: number;
  parentId: string | null;
}

function flattenTree(nodes: TreeFilterNode[], depth = 0, parentId: string | null = null): FlatNode[] {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    result.push({ id: node.id, name: node.name, depth, parentId });
    if (node.children?.length) {
      result.push(...flattenTree(node.children, depth + 1, node.id));
    }
  }
  return result;
}

function filterByKeyword(nodes: TreeFilterNode[], keyword: string): TreeFilterNode[] {
  if (!keyword) return nodes;
  const lower = keyword.toLowerCase();
  function matchTree(items: TreeFilterNode[]): TreeFilterNode[] {
    const result: TreeFilterNode[] = [];
    for (const item of items) {
      const children = item.children?.length ? matchTree(item.children) : [];
      const selfMatch = item.name.toLowerCase().includes(lower);
      if (selfMatch || children.length > 0) {
        result.push({ ...item, children: children.length > 0 ? children : undefined });
      }
    }
    return result;
  }
  return matchTree(nodes);
}

function collectExpandableIds(nodes: TreeFilterNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.children?.length) {
      ids.push(node.id);
      ids.push(...collectExpandableIds(node.children));
    }
  }
  return ids;
}

function buildLabelMap(nodes: TreeFilterNode[], getLabel: (n: TreeFilterNode) => string): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (items: TreeFilterNode[]) => {
    for (const n of items) {
      map.set(n.id, getLabel(n));
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return map;
}

const FilterTreeSelect: React.FC<FilterTreeSelectProps> = ({
  filterKey,
  label,
  treeData: propsTreeData,
  fetchUrl,
  fetchOptions,
  transformData,
  enabled = true,
  value,
  onChange,
  showSearch = false,
  multiple = false,
  active,
  hidden,
  display,
  getNodeLabel = (n) => n.name,
}) => {
  const fetchCtx = useMarsunFetch();
  const { data: fetchedTree } = useFetchData<TreeFilterNode[]>({
    data: propsTreeData,
    fetchUrl,
    fetchOptions,
    transformData,
    enabled,
    baseUrl: fetchCtx.baseUrl,
    defaultHeaders: fetchCtx.headers,
    timeoutMs: fetchCtx.timeoutMs,
  });

  const sourceTree = fetchedTree ?? [];

  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState<string | string[] | undefined>(
    value ?? (multiple ? [] : undefined),
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');

  const registerFn = useFilterRegister();
  const visibilityCtx = { filterKey, label, value };

  useEffect(() => {
    setLocalValue(value ?? (multiple ? [] : undefined));
    if (value === undefined || value === null) setSearchText('');
  }, [value, multiple]);

  useEffect(() => {
    if (sourceTree.length) {
      setExpandedKeys(new Set(collectExpandableIds(sourceTree)));
    }
  }, [sourceTree]);

  const labelMap = useMemo(
    () => buildLabelMap(sourceTree, getNodeLabel),
    [sourceTree, getNodeLabel],
  );

  const confirmedValueLabel = useMemo(() => {
    if (!sourceTree.length || value == null) return '';
    if (multiple) {
      const arr = value as string[];
      return arr.length > 0 ? arr.map((v) => labelMap.get(v) ?? v).join('、') : '';
    }
    return labelMap.get(value as string) ?? '';
  }, [sourceTree, value, multiple, labelMap]);

  useEffect(() => {
    if (!registerFn) return;
    if (!resolveFilterVisible({ display, hidden }, visibilityCtx)) {
      registerFn.unregister(filterKey);
      return;
    }
    if (confirmedValueLabel) {
      registerFn.register(filterKey, {
        label,
        valueLabel: confirmedValueLabel,
        onRemove: () => onChange?.(multiple ? [] : undefined),
      });
    } else {
      registerFn.unregister(filterKey);
    }
  }, [confirmedValueLabel, filterKey, label, display, hidden, registerFn, onChange, multiple, visibilityCtx]);

  const filteredTree = useMemo(
    () => (showSearch && searchText ? filterByKeyword(sourceTree, searchText) : sourceTree),
    [showSearch, searchText, sourceTree],
  );

  const flatNodes = useMemo(() => flattenTree(filteredTree), [filteredTree]);

  const hasChildrenMap = useMemo(() => {
    const map = new Map<string, boolean>();
    const walk = (nodes: TreeFilterNode[]) => {
      for (const n of nodes) {
        map.set(n.id, !!n.children?.length);
        if (n.children) walk(n.children);
      }
    };
    walk(filteredTree);
    return map;
  }, [filteredTree]);

  const childrenMap = useMemo(() => {
    const map = new Map<string, string[]>();
    const walk = (nodes: TreeFilterNode[]) => {
      for (const n of nodes) {
        if (n.children?.length) {
          const childIds: string[] = [];
          const collectAll = (node: TreeFilterNode) => {
            childIds.push(node.id);
            node.children?.forEach(collectAll);
          };
          n.children.forEach(collectAll);
          map.set(n.id, childIds);
          walk(n.children);
        }
      }
    };
    walk(filteredTree);
    return map;
  }, [filteredTree]);

  const parentMap = useMemo(() => {
    const map = new Map<string, string>();
    const walk = (nodes: TreeFilterNode[]) => {
      for (const n of nodes) {
        if (n.children?.length) {
          for (const child of n.children) map.set(child.id, n.id);
          walk(n.children);
        }
      }
    };
    walk(filteredTree);
    return map;
  }, [filteredTree]);

  const handleSingleSelect = useCallback(
    (nodeId: string) => {
      const next = localValue === nodeId ? undefined : nodeId;
      setLocalValue(next);
      onChange?.(next);
      setOpen(false);
    },
    [localValue, onChange],
  );

  const handleToggleMulti = useCallback(
    (nodeId: string) => {
      const arr = ((localValue as string[]) || []).slice();
      const childIds = childrenMap.get(nodeId);
      const parentId = parentMap.get(nodeId);
      if (childIds) {
        const isChecked = arr.includes(nodeId);
        if (isChecked) {
          const removeSet = new Set([nodeId, ...childIds]);
          setLocalValue(arr.filter((v) => !removeSet.has(v)));
        } else {
          setLocalValue([...new Set([...arr, nodeId, ...childIds])]);
        }
      } else if (arr.includes(nodeId)) {
        const next = arr.filter((v) => v !== nodeId);
        setLocalValue(parentId && next.includes(parentId) ? next.filter((v) => v !== parentId) : next);
      } else {
        const next = [...arr, nodeId];
        if (parentId) {
          const siblingIds = childrenMap.get(parentId) || [];
          if (siblingIds.every((id) => next.includes(id))) {
            setLocalValue([...new Set([...next, parentId])]);
          } else {
            setLocalValue(next);
          }
        } else {
          setLocalValue(next);
        }
      }
    },
    [localValue, childrenMap, parentMap],
  );

  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const isVisible = useCallback(
    (node: FlatNode) => {
      if (node.parentId === null) return true;
      if (showSearch && searchText) return true;
      return expandedKeys.has(node.parentId);
    },
    [expandedKeys, showSearch, searchText],
  );

  if (!resolveFilterVisible({ display, hidden }, visibilityCtx)) return null;

  return (
    <FilterPopover
      label={label}
      active={active || (multiple ? (localValue as string[])?.length > 0 : !!value)}
      open={open}
      onOpenChange={setOpen}
      onConfirm={multiple ? () => { onChange?.(localValue); setOpen(false); } : undefined}
      onReset={() => {
        const next = multiple ? [] : undefined;
        setLocalValue(next);
        setSearchText('');
        onChange?.(next);
        setOpen(false);
      }}
    >
      {showSearch && (
        <Search
          placeholder={`搜索${label}`}
          allowClear
          size="middle"
          className={classNames('filter-tree-select-search', styles['filter-tree-select-search'])}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      )}
      <div className={classNames('filter-tree-select-options', styles['filter-tree-select-options'])}>
        {flatNodes.map((node) => {
          if (!isVisible(node)) return null;
          const isLeaf = !hasChildrenMap.get(node.id);
          const isExpanded = expandedKeys.has(node.id);
          const isSingleSelected = !multiple && localValue === node.id;
          const isMultiChecked = multiple && ((localValue as string[]) || []).includes(node.id);
          return (
            <div
              key={node.id}
              className={classNames(
                'filter-tree-select-option',
                styles['filter-tree-select-option'],
                isSingleSelected && styles['filter-tree-select-option-selected'],
              )}
              style={{ paddingLeft: 8 + node.depth * 20 }}
              onClick={() => (multiple ? handleToggleMulti(node.id) : handleSingleSelect(node.id))}
            >
              {!isLeaf ? (
                <span
                  className={styles['filter-tree-select-expand-icon']}
                  onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
                >
                  {isExpanded || (showSearch && !!searchText) ? <ChevronDown style={{ fontSize: 10 }} /> : <ChevronRight style={{ fontSize: 10 }} />}
                </span>
              ) : (
                <span className={styles['filter-tree-select-expand-placeholder']} />
              )}
              {multiple && <Checkbox checked={isMultiChecked} />}
              <span className={styles['filter-tree-select-node-label']}>{node.name}</span>
              {!multiple && isSingleSelected && <Check className={styles['filter-tree-select-option-check']} />}
            </div>
          );
        })}
        {flatNodes.length === 0 && <div className={styles['filter-tree-select-empty']}>暂无数据</div>}
      </div>
      {multiple && (localValue as string[])?.length > 0 && (
        <div className={styles['filter-tree-select-selected-bar']}>
          <div className={styles['filter-tree-select-selected-label']}>已选：</div>
          <Space size={[4, 4]} wrap>
            {(localValue as string[]).map((v) => (
              <span key={v} className={styles['filter-tree-select-selected-tag']} onClick={(e) => { e.stopPropagation(); handleToggleMulti(v); }}>
                {labelMap.get(v) ?? v}
                <X className={styles['filter-tree-select-selected-remove']} />
              </span>
            ))}
          </Space>
        </div>
      )}
    </FilterPopover>
  );
};

export default FilterTreeSelect;
