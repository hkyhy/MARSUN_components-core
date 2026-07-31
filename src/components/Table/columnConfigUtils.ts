import type { ColumnsType } from 'antd/es/table';
import type {
  ColumnConfigPanelItem,
  ColumnTypeAny,
  TableColumnConfigItem,
} from './columnConfigTypes';

export type { ColumnTypeAny };
/** 列配置齿轮列 key；不进面板 / 持久化 */
export const COLUMN_CONFIG_COL_KEY = '__marsun_column_config';
/** 弹性占位列：吃掉表宽多余空间，避免固定列被撑开；不进面板 / 持久化 */
export const FLEX_SPACER_COL_KEY = '__marsun_flex_spacer';

function colKey(col: ColumnTypeAny, index: number): string {
  if (col.key != null && String(col.key) !== '') return String(col.key);
  if (col.dataIndex != null) {
    return Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : String(col.dataIndex);
  }
  return `__col_${index}`;
}

/** 内部列（齿轮 / 弹性占位等）：不进列配置面板与持久化 */
export function isInternalColumnKey(key: string): boolean {
  return (
    key === COLUMN_CONFIG_COL_KEY || key === FLEX_SPACER_COL_KEY || key.startsWith('__marsun_')
  );
}

function isInternalCol(col: ColumnTypeAny, index: number): boolean {
  return isInternalColumnKey(colKey(col, index));
}

/** 叶子相对父级的短 id：TGCV_finished → finished；否则用完整 key */
export function shortChildId(parentId: string, childKey: string): string {
  const prefix = `${parentId}_`;
  if (childKey.startsWith(prefix)) return childKey.slice(prefix.length);
  return childKey;
}

function titleToLabel(title: unknown): string {
  if (title == null) return '';
  if (typeof title === 'string' || typeof title === 'number') return String(title);
  return '';
}

/** 从 columns 生成默认配置（全部显示，保持树结构；子 id 用短名） */
export function columnsToConfig(
  columns: ColumnsType<Record<string, unknown>> | undefined,
  parentId?: string,
): TableColumnConfigItem[] {
  if (!columns?.length) return [];
  return (columns as ColumnTypeAny[])
    .map((col, i) => {
      if (isInternalCol(col, i)) return null;
      const full = colKey(col, i);
      const id = parentId ? shortChildId(parentId, full) : full;
      const children = col.children?.length
        ? columnsToConfig(col.children as ColumnsType<Record<string, unknown>>, full)
        : undefined;
      return children?.length ? { id, children } : { id };
    })
    .filter(Boolean) as TableColumnConfigItem[];
}

/** columns → 面板树（含 title 文案）；子 id 用短名与持久化一致 */
export function columnsToPanelItems(
  columns: ColumnsType<Record<string, unknown>> | undefined,
  hiddenIds?: Set<string>,
  parentId?: string,
): ColumnConfigPanelItem[] {
  if (!columns?.length) return [];
  return (columns as ColumnTypeAny[])
    .map((col, i) => {
      if (isInternalCol(col, i)) return null;
      const full = colKey(col, i);
      const id = parentId ? shortChildId(parentId, full) : full;
      const label = titleToLabel(col.title) || id;
      const children = col.children?.length
        ? columnsToPanelItems(col.children as ColumnsType<Record<string, unknown>>, hiddenIds, full)
        : undefined;
      const childAllHidden =
        children?.length && children.every((c) => c.hidden || (hiddenIds?.has(c.id) ?? false));
      const hidden = hiddenIds?.has(id) || Boolean(childAllHidden);
      return {
        id,
        title: col.title,
        label,
        hidden: Boolean(hidden),
        children,
      };
    })
    .filter(Boolean) as ColumnConfigPanelItem[];
}

function isHiddenItem(item: TableColumnConfigItem): boolean {
  if (item.hidden) return true;
  if (item.children?.length && item.children.every(isHiddenItem)) return true;
  return false;
}

function findChildCol(parent: ColumnTypeAny, childId: string): ColumnTypeAny | undefined {
  const kids = (parent.children || []) as ColumnTypeAny[];
  return kids.find((c, i) => {
    const full = colKey(c, i);
    const parentFull = colKey(parent, 0);
    // parent key 可能与 map 不一致，用 shortChildId 对每个可能的 parent key
    return (
      shortChildId(String(parent.key ?? ''), full) === childId ||
      shortChildId(parentFull, full) === childId ||
      full === childId ||
      full.endsWith(`_${childId}`)
    );
  });
}

/** 按配置重排列并过滤 hidden；子列相对父列解析 */
export function applyColumnConfig<RecordType extends object>(
  columns: ColumnsType<RecordType> | undefined,
  config: TableColumnConfigItem[] | null | undefined,
): ColumnsType<RecordType> {
  if (!columns?.length) return columns || [];
  if (!config?.length) return columns;

  const topById = new Map<string, ColumnTypeAny>();
  (columns as ColumnTypeAny[]).forEach((col, i) => {
    topById.set(colKey(col, i), col);
  });

  const buildLevel = (
    items: TableColumnConfigItem[],
    sourceCols: ColumnTypeAny[],
    parent?: ColumnTypeAny,
  ): ColumnTypeAny[] => {
    const out: ColumnTypeAny[] = [];
    const used = new Set<string>();

    for (const item of items) {
      if (isHiddenItem(item)) {
        used.add(item.id);
        continue;
      }
      let src: ColumnTypeAny | undefined;
      if (parent) {
        src = findChildCol(parent, item.id);
      } else {
        src = topById.get(item.id);
      }
      if (!src) continue;
      used.add(item.id);

      if (item.children?.length && src.children?.length) {
        const childCols = buildLevel(item.children, src.children as ColumnTypeAny[], src);
        if (!childCols.length) continue;
        out.push({ ...src, children: childCols as ColumnsType<Record<string, unknown>> });
      } else {
        const next = { ...src };
        if (!item.children) {
          // keep children as-is when config leaf but source has group — strip if short ids only
        }
        out.push(next);
      }
    }

    // 配置未覆盖的同级列追加末尾
    sourceCols.forEach((col, i) => {
      const full = colKey(col, i);
      const id = parent ? shortChildId(String(parent.key ?? colKey(parent, 0)), full) : full;
      if (!used.has(id) && !used.has(full)) {
        out.push(col);
      }
    });

    return out;
  };

  return buildLevel(config, columns as ColumnTypeAny[]) as ColumnsType<RecordType>;
}

/** 找最右可见叶子列路径（用于挂齿轮） */
export function findRightmostLeafPath(
  columns: ColumnsType<Record<string, unknown>> | undefined,
): number[] | null {
  if (!columns?.length) return null;
  const cols = columns as ColumnTypeAny[];
  const last = cols.length - 1;
  const col = cols[last];
  if (!col) return null;
  if (col.children?.length) {
    const sub = findRightmostLeafPath(col.children as ColumnsType<Record<string, unknown>>);
    if (!sub) return [last];
    return [last, ...sub];
  }
  return [last];
}

export function getColumnFixed(
  columns: ColumnsType<Record<string, unknown>> | undefined,
  path: number[],
): 'left' | 'right' | boolean | undefined {
  let cur: ColumnTypeAny[] | undefined = columns as ColumnTypeAny[] | undefined;
  let fixed: 'left' | 'right' | boolean | undefined;
  for (const idx of path) {
    if (!cur?.[idx]) return fixed;
    fixed = cur[idx].fixed ?? fixed;
    cur = cur[idx].children as ColumnTypeAny[] | undefined;
  }
  return fixed;
}

/** 在指定 path 的叶子 title 上注入节点 */
export function injectTitleAtPath<RecordType extends object>(
  columns: ColumnsType<RecordType>,
  path: number[],
  inject: (originalTitle: unknown) => unknown,
): ColumnsType<RecordType> {
  if (!path.length) return columns;
  const clone = (columns as ColumnTypeAny[]).map((c) => ({ ...c }));
  let cur = clone;
  for (let i = 0; i < path.length; i++) {
    const idx = path[i]!;
    const prev = cur[idx];
    if (!prev) return columns;
    const col = { ...prev };
    cur[idx] = col;
    if (i === path.length - 1) {
      col.title = inject(col.title) as ColumnTypeAny['title'];
    } else if (col.children) {
      col.children = (col.children as ColumnTypeAny[]).map((c) => ({ ...c }));
      cur = col.children as ColumnTypeAny[];
    }
  }
  return clone as ColumnsType<RecordType>;
}

/** 面板草稿 → 持久化 config（hidden 的也写入，保证顺序可恢复） */
export function panelItemsToConfig(items: ColumnConfigPanelItem[]): TableColumnConfigItem[] {
  return items.map((it) => {
    const children = it.children?.length ? panelItemsToConfig(it.children) : undefined;
    const base: TableColumnConfigItem = { id: it.id };
    if (it.hidden) base.hidden = true;
    if (children?.length) base.children = children;
    return base;
  });
}

/** 按配置路径隐藏节点（含子树） */
export function hideColumnAtPath(
  items: TableColumnConfigItem[],
  path: string[],
): TableColumnConfigItem[] {
  if (!path.length) return items;
  const [head, ...rest] = path;
  return items.map((it) => {
    if (it.id !== head) return it;
    if (!rest.length) {
      return hideConfigDeep(it);
    }
    const children = it.children?.length ? hideColumnAtPath(it.children, rest) : it.children;
    const allHidden = children?.length ? children.every(isConfigHidden) : it.hidden;
    return { ...it, children, hidden: allHidden || it.hidden };
  });
}

function hideConfigDeep(item: TableColumnConfigItem): TableColumnConfigItem {
  return {
    ...item,
    hidden: true,
    children: item.children?.map(hideConfigDeep),
  };
}

function isConfigHidden(item: TableColumnConfigItem): boolean {
  if (item.hidden) return true;
  if (item.children?.length && item.children.every(isConfigHidden)) return true;
  return false;
}

/** 用已保存 config 给面板打 hidden 标记，并按 config 排序 */
export function mergePanelWithConfig(
  defaults: ColumnConfigPanelItem[],
  config: TableColumnConfigItem[] | null | undefined,
): ColumnConfigPanelItem[] {
  if (!config?.length) return defaults.map(clonePanel);

  const byId = new Map(defaults.map((d) => [d.id, d]));
  const used = new Set<string>();

  const mapItem = (
    cfg: TableColumnConfigItem,
    fallback?: ColumnConfigPanelItem,
  ): ColumnConfigPanelItem | null => {
    const src = fallback || byId.get(cfg.id);
    if (!src) return null;
    used.add(cfg.id);
    const childDefaults = src.children || [];
    const childById = new Map(childDefaults.map((c) => [c.id, c]));
    let children: ColumnConfigPanelItem[] | undefined;
    if (cfg.children?.length) {
      children = cfg.children
        .map((c) => mapItem(c, childById.get(c.id)))
        .filter(Boolean) as ColumnConfigPanelItem[];
      for (const cd of childDefaults) {
        if (!cfg.children.some((c) => c.id === cd.id)) {
          children.push(clonePanel(cd));
        }
      }
    } else if (childDefaults.length) {
      children = childDefaults.map(clonePanel);
    }
    const hidden =
      Boolean(cfg.hidden) || Boolean(children?.length && children.every((c) => c.hidden));
    return {
      id: src.id,
      title: src.title,
      label: src.label,
      hidden,
      children,
    };
  };

  const ordered: ColumnConfigPanelItem[] = [];
  for (const cfg of config) {
    const mapped = mapItem(cfg);
    if (mapped) ordered.push(mapped);
  }
  for (const d of defaults) {
    if (!used.has(d.id)) ordered.push(clonePanel(d));
  }
  return ordered;
}

function clonePanel(item: ColumnConfigPanelItem): ColumnConfigPanelItem {
  return {
    ...item,
    children: item.children?.map(clonePanel),
  };
}

export function splitVisibleHidden(items: ColumnConfigPanelItem[]): {
  visible: ColumnConfigPanelItem[];
  hidden: ColumnConfigPanelItem[];
} {
  const visible: ColumnConfigPanelItem[] = [];
  const hidden: ColumnConfigPanelItem[] = [];
  for (const it of items) {
    if (it.hidden) hidden.push(it);
    else visible.push(it);
  }
  return { visible, hidden };
}
