import { Empty } from '@/components/Empty';
import { Cascader, Input, Space, Spin } from 'antd';
import type { DefaultOptionType } from 'antd/es/cascader';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TreeFilterNode } from '../FilterTreeSelect';
import FilterPopover from '../FilterPopover';
import type { BaseFilterProps, FilterLoadDataContext } from '../types';
import { resolveFilterVisible } from '../types';
import { useFilterFieldBridge, useFilterRegister } from '../useFilterState';
import styles from './style.module.scss';

const { Search } = Input;

export type { TreeFilterNode };

export type CascaderPath = string[];

export interface FilterCascaderProps extends BaseFilterProps {
  /** 树数据（与 FilterTreeSelect 同构）；优先于 loadData */
  treeData?: TreeFilterNode[];
  /** 已转换的 Cascader options；与 treeData 二选一（同时存在以 options 为准） */
  options?: DefaultOptionType[];
  loadData?: (ctx: FilterLoadDataContext) => Promise<TreeFilterNode[]>;
  enabled?: boolean;
  /** leafOnly 时为叶子 id；多选为叶子 id 数组 */
  value?: string | string[] | undefined;
  onChange?: (value: string | string[] | undefined) => void;
  /** 完整路径变更（单选 string[]；多选 string[][]） */
  onChangePath?: (paths: CascaderPath | CascaderPath[] | undefined) => void;
  showSearch?: boolean;
  multiple?: boolean;
  /**
   * 仅叶子写入最终值（默认 true）。
   * Cascader changeOnSelect=false，父级不可单独作为已选值。
   */
  leafOnly?: boolean;
  getNodeLabel?: (node: TreeFilterNode) => string;
  panelExtra?: React.ReactNode;
  panelWidth?: number;
  loading?: boolean;
}

type CascaderOption = DefaultOptionType & {
  value: string;
  label: React.ReactNode;
  children?: CascaderOption[];
  isLeaf?: boolean;
};

/** TreeFilterNode → antd Cascader options */
export function treeToCascaderOptions(
  nodes: TreeFilterNode[] | undefined,
  getLabel: (n: TreeFilterNode) => string = (n) => n.name,
): CascaderOption[] {
  if (!nodes?.length) return [];
  return nodes.map((n) => {
    const children = n.children?.length ? treeToCascaderOptions(n.children, getLabel) : undefined;
    return {
      value: n.id,
      label: getLabel(n),
      children,
      isLeaf: !children?.length,
    };
  });
}

function filterOptionsByKeyword(options: CascaderOption[], keyword: string): CascaderOption[] {
  if (!keyword.trim()) return options;
  const lower = keyword.toLowerCase();
  const walk = (opts: CascaderOption[]): CascaderOption[] => {
    const result: CascaderOption[] = [];
    for (const opt of opts) {
      const label =
        typeof opt.label === 'string' || typeof opt.label === 'number'
          ? String(opt.label)
          : String(opt.value);
      const children = opt.children?.length ? walk(opt.children) : [];
      const selfMatch = label.toLowerCase().includes(lower);
      if (selfMatch || children.length > 0) {
        result.push({
          ...opt,
          children: children.length > 0 ? children : undefined,
          isLeaf: !(children.length > 0),
        });
      }
    }
    return result;
  };
  return walk(options);
}

function buildLeafPathMap(options: CascaderOption[]): Map<string, CascaderPath> {
  const map = new Map<string, CascaderPath>();
  const walk = (opts: CascaderOption[], prefix: CascaderPath) => {
    for (const opt of opts) {
      const path = [...prefix, String(opt.value)];
      if (opt.children?.length) {
        walk(opt.children, path);
      } else {
        map.set(String(opt.value), path);
      }
    }
  };
  walk(options, []);
  return map;
}

function findCascaderNode(options: CascaderOption[], path: CascaderPath): CascaderOption | null {
  let nodes = options;
  let found: CascaderOption | null = null;
  for (const id of path) {
    found = nodes.find((n) => String(n.value) === String(id)) ?? null;
    if (!found) return null;
    nodes = found.children ?? [];
  }
  return found;
}

function collectDescendantLeafIds(node: CascaderOption): string[] {
  if (!node.children?.length) return [String(node.value)];
  return node.children.flatMap(collectDescendantLeafIds);
}

/** leafOnly：多选路径可能因 SHOW_PARENT 塌成父级，展开为叶子 id */
function pathsToLeafIds(
  paths: CascaderPath[],
  options: CascaderOption[],
  leafPathMap: Map<string, CascaderPath>,
  leafOnly: boolean,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (id: string) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    out.push(id);
  };

  for (const path of paths) {
    if (!path?.length) continue;
    const last = String(path[path.length - 1]);
    if (leafPathMap.has(last)) {
      push(last);
      continue;
    }
    if (!leafOnly) {
      push(last);
      continue;
    }
    const node = findCascaderNode(options, path.map(String));
    if (node) {
      collectDescendantLeafIds(node).forEach(push);
    }
  }
  return out;
}

function buildLabelMapFromOptions(options: CascaderOption[]): Map<string, string> {
  const map = new Map<string, string>();
  const walk = (opts: CascaderOption[]) => {
    for (const opt of opts) {
      const label =
        typeof opt.label === 'string' || typeof opt.label === 'number'
          ? String(opt.label)
          : String(opt.value);
      map.set(String(opt.value), label);
      if (opt.children?.length) walk(opt.children);
    }
  };
  walk(options);
  return map;
}

function leafToCascaderValue(
  leaf: string | string[] | undefined,
  leafPathMap: Map<string, CascaderPath>,
  multiple: boolean,
): CascaderPath | CascaderPath[] | undefined {
  if (leaf == null || leaf === '') return multiple ? [] : undefined;
  if (multiple) {
    const arr = Array.isArray(leaf) ? leaf : [leaf];
    return arr.map((id) => leafPathMap.get(String(id)) || [String(id)]).filter((p) => p.length);
  }
  const id = Array.isArray(leaf) ? leaf[0] : leaf;
  if (id == null || id === '') return undefined;
  return leafPathMap.get(String(id)) || [String(id)];
}

function cascaderValueToLeaf(
  next: CascaderPath | CascaderPath[] | null,
  multiple: boolean,
  leafOnly: boolean,
  options: CascaderOption[],
  leafPathMap: Map<string, CascaderPath>,
): string | string[] | undefined {
  if (next == null || (Array.isArray(next) && next.length === 0)) {
    return multiple ? [] : undefined;
  }
  if (multiple) {
    const paths = (next as CascaderPath[]).filter((p) => Array.isArray(p) && p.length);
    return pathsToLeafIds(
      paths.map((p) => p.map(String)),
      options,
      leafPathMap,
      leafOnly,
    );
  }
  const path = (next as CascaderPath).map(String);
  if (!path.length) return undefined;
  const leaves = pathsToLeafIds([path], options, leafPathMap, leafOnly);
  if (leafOnly && leaves.length === 0) return undefined;
  return leaves[0];
}

const FilterCascader: React.FC<FilterCascaderProps> = ({
  filterKey,
  label,
  treeData: propsTreeData,
  options: propsOptions,
  loadData,
  enabled = true,
  value,
  onChange,
  onChangePath,
  showSearch = false,
  multiple = false,
  leafOnly = true,
  active,
  hidden,
  display,
  dependsOn,
  clearOnDepsChange = true,
  getNodeLabel = (n) => n.name,
  panelExtra,
  panelWidth,
  loading: loadingProp = false,
}) => {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onChangePathRef = useRef(onChangePath);
  onChangePathRef.current = onChangePath;

  // 两列路径：分厂列 + 品种长文案列，默认略宽；有 panelExtra 再加一点
  const resolvedPanelWidth = panelWidth ?? (panelExtra ? 520 : 440);

  const { resolvedLabel, values, depsKey } = useFilterFieldBridge({
    filterKey,
    value,
    label,
    dependsOn,
    clearOnDepsChange,
    onDepsClear: () => {
      onChangeRef.current?.(multiple ? [] : undefined);
      onChangePathRef.current?.(undefined);
    },
  });

  const [loadedTree, setLoadedTree] = useState<TreeFilterNode[]>([]);
  const [loadDataLoading, setLoadDataLoading] = useState(false);
  const loadDataRef = useRef(loadData);
  loadDataRef.current = loadData;

  useEffect(() => {
    if (!loadDataRef.current || propsTreeData != null || propsOptions != null || !enabled) return;
    let cancelled = false;
    setLoadDataLoading(true);
    (async () => {
      try {
        const next = await loadDataRef.current!({ values });
        if (!cancelled) setLoadedTree(next ?? []);
      } catch {
        if (!cancelled) setLoadedTree([]);
      } finally {
        if (!cancelled) setLoadDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, enabled, propsTreeData, propsOptions, loadData]);

  const cascaderOptions = useMemo(() => {
    if (propsOptions?.length) return propsOptions as CascaderOption[];
    const tree = propsTreeData ?? (loadData ? loadedTree : []);
    return treeToCascaderOptions(tree, getNodeLabel);
  }, [propsOptions, propsTreeData, loadData, loadedTree, getNodeLabel]);

  const optionsLoading = loadingProp || loadDataLoading;
  const leafPathMap = useMemo(() => buildLeafPathMap(cascaderOptions), [cascaderOptions]);
  const labelMap = useMemo(() => buildLabelMapFromOptions(cascaderOptions), [cascaderOptions]);

  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [localValue, setLocalValue] = useState<string | string[] | undefined>(
    value ?? (multiple ? [] : undefined),
  );

  useEffect(() => {
    setLocalValue(value ?? (multiple ? [] : undefined));
    if (value === undefined || value === null) setSearchText('');
  }, [value, multiple]);

  const confirmedValueLabel = useMemo(() => {
    if (value == null) return '';
    if (multiple) {
      const arr = value as string[];
      return arr.length > 0 ? arr.map((v) => labelMap.get(v) ?? v).join('、') : '';
    }
    return labelMap.get(value as string) ?? '';
  }, [value, multiple, labelMap]);

  const registerFn = useFilterRegister();
  const visibilityCtx = { filterKey, label: resolvedLabel, value };

  useEffect(() => {
    if (!registerFn) return;
    if (!resolveFilterVisible({ display, hidden }, visibilityCtx)) {
      registerFn.unregister(filterKey);
      return;
    }
    if (confirmedValueLabel) {
      registerFn.register(filterKey, {
        label: resolvedLabel,
        valueLabel: confirmedValueLabel,
        onRemove: () => {
          onChange?.(multiple ? [] : undefined);
          onChangePath?.(undefined);
        },
      });
    } else {
      registerFn.unregister(filterKey);
    }
  }, [
    confirmedValueLabel,
    filterKey,
    resolvedLabel,
    display,
    hidden,
    registerFn,
    onChange,
    onChangePath,
    multiple,
    visibilityCtx,
  ]);

  const displayOptions = useMemo(
    () =>
      showSearch && searchText
        ? filterOptionsByKeyword(cascaderOptions, searchText)
        : cascaderOptions,
    [showSearch, searchText, cascaderOptions],
  );

  const cascaderValue = useMemo(
    () => leafToCascaderValue(localValue, leafPathMap, multiple),
    [localValue, leafPathMap, multiple],
  );

  const leafIdsToPaths = useCallback(
    (leafIds: string[]): CascaderPath[] =>
      leafIds
        .map((id) => leafPathMap.get(String(id)))
        .filter((p): p is CascaderPath => !!p?.length),
    [leafPathMap],
  );

  const emitChange = useCallback(
    (nextLeaf: string | string[] | undefined, paths: CascaderPath | CascaderPath[] | undefined) => {
      setLocalValue(nextLeaf);
      onChange?.(nextLeaf);
      onChangePath?.(paths);
    },
    [onChange, onChangePath],
  );

  const revertToCommitted = useCallback(() => {
    setLocalValue(value ?? (multiple ? [] : undefined));
    setSearchText('');
  }, [value, multiple]);

  const handleCascaderChange = useCallback(
    (next: (string | number | null)[] | (string | number | null)[][] | null) => {
      const normalized = next as CascaderPath | CascaderPath[] | null;
      const leaf = cascaderValueToLeaf(
        normalized,
        multiple,
        leafOnly,
        cascaderOptions,
        leafPathMap,
      );
      if (multiple) {
        // 多选：勾选只改草稿，确定才 onChange（对齐 FilterSelect / FilterTreeSelect）
        const leafArr = Array.isArray(leaf) ? leaf : leaf ? [leaf] : [];
        setLocalValue(leafArr);
        return;
      }
      const id = typeof leaf === 'string' ? leaf : undefined;
      const path = id ? leafPathMap.get(id) : undefined;
      emitChange(id, path);
      setOpen(false);
    },
    [multiple, leafOnly, cascaderOptions, leafPathMap, emitChange],
  );

  const handleConfirm = () => {
    if (!multiple) return;
    const leafArr = Array.isArray(localValue) ? localValue : [];
    const paths = leafIdsToPaths(leafArr);
    onChange?.(leafArr);
    onChangePath?.(paths);
    setOpen(false);
  };

  const handleDiscardDraft = () => {
    revertToCommitted();
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && multiple) {
      revertToCommitted();
    }
    setOpen(nextOpen);
  };

  const isActive =
    active ?? (multiple ? Array.isArray(value) && value.length > 0 : value != null && value !== '');

  if (!resolveFilterVisible({ display, hidden }, visibilityCtx)) {
    return null;
  }

  return (
    <FilterPopover
      label={resolvedLabel}
      active={isActive}
      loading={optionsLoading}
      width={resolvedPanelWidth}
      open={open}
      onOpenChange={handleOpenChange}
      onConfirm={multiple ? handleConfirm : undefined}
      onReset={multiple ? handleDiscardDraft : undefined}
    >
      <div className={classNames('filter-cascader-root', styles['filter-cascader-root'])}>
        {panelExtra ? (
          <div
            className={classNames(
              'filter-cascader-panel-extra',
              styles['filter-cascader-panel-extra'],
            )}
          >
            {panelExtra}
          </div>
        ) : null}
        {showSearch ? (
          <div className={classNames('filter-cascader-search', styles['filter-cascader-search'])}>
            <Search
              placeholder={`搜索${resolvedLabel}`}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        ) : null}
        {optionsLoading ? (
          <div className={classNames('filter-cascader-loading', styles['filter-cascader-loading'])}>
            <Spin size="small" />
          </div>
        ) : displayOptions.length === 0 ? (
          <Empty iconType="simple" description="暂无选项" />
        ) : (
          <div
            className={classNames(
              'filter-cascader-panel-wrap',
              styles['filter-cascader-panel-wrap'],
            )}
          >
            <Cascader.Panel
              className={classNames('filter-cascader-panel', styles['filter-cascader-panel'])}
              options={displayOptions}
              value={cascaderValue as never}
              onChange={handleCascaderChange as never}
              multiple={multiple}
              changeOnSelect={!leafOnly}
              // leafOnly 多选：禁止 SHOW_PARENT 把整厂塌成父级 Code
              {...(multiple && leafOnly ? { showCheckedStrategy: Cascader.SHOW_CHILD } : {})}
            />
          </div>
        )}
        {multiple && Array.isArray(localValue) && localValue.length > 0 ? (
          <div
            className={classNames(
              'filter-cascader-selected-bar',
              styles['filter-cascader-selected-bar'],
            )}
          >
            <Space size={[4, 4]} wrap>
              <span className={styles['filter-cascader-selected-count']}>
                已选 {localValue.length}
              </span>
            </Space>
          </div>
        ) : null}
      </div>
    </FilterPopover>
  );
};

export default FilterCascader;
