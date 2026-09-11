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

/** 列拖宽默认最小 / 最大（px） */
export const COLUMN_RESIZE_MIN_WIDTH = 48;
export const COLUMN_RESIZE_MAX_WIDTH = 480;

export function clampColumnWidth(
  w: number,
  min: number = COLUMN_RESIZE_MIN_WIDTH,
  max: number = COLUMN_RESIZE_MAX_WIDTH,
): number {
  if (!Number.isFinite(w)) return min;
  const lo = Number.isFinite(min) ? min : COLUMN_RESIZE_MIN_WIDTH;
  const hi = Number.isFinite(max) ? max : COLUMN_RESIZE_MAX_WIDTH;
  return Math.min(hi, Math.max(lo, Math.round(w)));
}

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

export type ApplyColumnConfigOptions = {
  minWidth?: number;
  maxWidth?: number;
};

/** 按配置重排列并过滤 hidden；子列相对父列解析；叶子 width 写入并 clamp */
export function applyColumnConfig<RecordType extends object>(
  columns: ColumnsType<RecordType> | undefined,
  config: TableColumnConfigItem[] | null | undefined,
  options?: ApplyColumnConfigOptions,
): ColumnsType<RecordType> {
  if (!columns?.length) return columns || [];
  if (!config?.length) return columns;

  const minW = options?.minWidth ?? COLUMN_RESIZE_MIN_WIDTH;
  const maxW = options?.maxWidth ?? COLUMN_RESIZE_MAX_WIDTH;

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
        if (typeof item.width === 'number' && Number.isFinite(item.width)) {
          next.width = clampColumnWidth(item.width, minW, maxW);
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

/** 仅按 path 合并叶子 width（不改顺序/显隐）；overrides 优先 */
export function applyLeafWidthOverrides<RecordType extends object>(
  columns: ColumnsType<RecordType> | undefined,
  widthByPath: Record<string, number> | null | undefined,
  options?: ApplyColumnConfigOptions,
  parentFullKey?: string,
  path: string[] = [],
): ColumnsType<RecordType> {
  if (!columns?.length || !widthByPath || !Object.keys(widthByPath).length) {
    return columns || [];
  }
  const minW = options?.minWidth ?? COLUMN_RESIZE_MIN_WIDTH;
  const maxW = options?.maxWidth ?? COLUMN_RESIZE_MAX_WIDTH;

  return (columns as ColumnTypeAny[]).map((col, i) => {
    const full = colKey(col, i);
    if (isInternalColumnKey(full)) return col as ColumnTypeAny;
    const configId = parentFullKey ? shortChildId(parentFullKey, full) : full;
    const nextPath = [...path, configId];
    if (col.children?.length) {
      return {
        ...col,
        children: applyLeafWidthOverrides(
          col.children as ColumnsType<RecordType>,
          widthByPath,
          options,
          full,
          nextPath,
        ),
      } as ColumnTypeAny;
    }
    const key = nextPath.join('/');
    const raw = widthByPath[key];
    if (typeof raw !== 'number' || !Number.isFinite(raw)) return col as ColumnTypeAny;
    return { ...col, width: clampColumnWidth(raw, minW, maxW) } as ColumnTypeAny;
  }) as ColumnsType<RecordType>;
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

/** 按 path 写入叶子 width；path 不存在时原样返回 */
export function setColumnWidthAtPath(
  items: TableColumnConfigItem[],
  path: string[],
  width: number,
  options?: ApplyColumnConfigOptions,
): TableColumnConfigItem[] {
  if (!path.length) return items;
  const minW = options?.minWidth ?? COLUMN_RESIZE_MIN_WIDTH;
  const maxW = options?.maxWidth ?? COLUMN_RESIZE_MAX_WIDTH;
  const clamped = clampColumnWidth(width, minW, maxW);
  const [head, ...rest] = path;
  let hit = false;
  const next = items.map((it) => {
    if (it.id !== head) return it;
    hit = true;
    if (!rest.length) {
      return { ...it, width: clamped };
    }
    if (!it.children?.length) return it;
    return { ...it, children: setColumnWidthAtPath(it.children, rest, clamped, options) };
  });
  return hit ? next : items;
}

/** 按 path 清除叶子自定义 width（删字段，回到代码默认/弹性） */
export function clearColumnWidthAtPath(
  items: TableColumnConfigItem[],
  path: string[],
): TableColumnConfigItem[] {
  if (!path.length) return items;
  const [head, ...rest] = path;
  let hit = false;
  const next = items.map((it) => {
    if (it.id !== head) return it;
    hit = true;
    if (!rest.length) {
      if (it.width === undefined) return it;
      const { width: _w, ...restItem } = it;
      return restItem;
    }
    if (!it.children?.length) return it;
    return { ...it, children: clearColumnWidthAtPath(it.children, rest) };
  });
  return hit ? next : items;
}

/** 面板确认后的 config 不含 width；从旧 prefs 按 path 拷回，避免拖宽被面板保存冲掉。 */
export function copyColumnWidths(
  target: TableColumnConfigItem[],
  source: TableColumnConfigItem[] | null | undefined,
): TableColumnConfigItem[] {
  if (!source?.length) return target;
  const widthByPath = new Map<string, number>();
  const collect = (items: TableColumnConfigItem[], prefix: string) => {
    for (const it of items) {
      const key = prefix ? `${prefix}/${it.id}` : it.id;
      if (typeof it.width === 'number' && Number.isFinite(it.width)) {
        widthByPath.set(key, it.width);
      }
      if (it.children?.length) collect(it.children, key);
    }
  };
  collect(source, '');
  if (!widthByPath.size) return target;

  const apply = (items: TableColumnConfigItem[], prefix: string): TableColumnConfigItem[] =>
    items.map((it) => {
      const key = prefix ? `${prefix}/${it.id}` : it.id;
      const children = it.children?.length ? apply(it.children, key) : it.children;
      const w = widthByPath.get(key);
      if (w == null) return children !== it.children ? { ...it, children } : it;
      return { ...it, width: w, children };
    });
  return apply(target, '');
}

/** prefs/config 是否含任意叶子自定义 width（用于挂弹性占位列） */
export function configHasLeafWidths(items: TableColumnConfigItem[] | null | undefined): boolean {
  if (!items?.length) return false;
  for (const it of items) {
    if (typeof it.width === 'number' && Number.isFinite(it.width)) return true;
    if (it.children?.length && configHasLeafWidths(it.children)) return true;
  }
  return false;
}

/** 是否固定列（left / right / true / start / end）；固定列禁止拖宽，以免 header `position:relative` 冲掉 sticky */
export function isFixedColumn(col: { fixed?: unknown } | null | undefined): boolean {
  const f = col?.fixed;
  return f === 'left' || f === 'right' || f === true || f === 'start' || f === 'end';
}

/**
 * 将弹性占位插到首个右侧固定列 **之前**（`right` / `end`）。
 * 若插在右侧固定列之后，antd 固定列栈会断，表现为操作列不再 sticky / 表头错位。
 */
export function insertBeforeFixedRight<T extends { fixed?: unknown }>(
  columns: T[],
  spacer: T,
): T[] {
  if (!columns.length) return [spacer];
  const idx = columns.findIndex((c) => c.fixed === 'right' || c.fixed === 'end');
  if (idx < 0) return [...columns, spacer];
  return [...columns.slice(0, idx), spacer, ...columns.slice(idx)];
}

/**
 * 叶子 path 签名；columns 结构变时用于清空 widthOverrides。
 * 例：`factory\0name\0TGCV/finished`
 */
export function columnsLeafPathSignature(
  columns: ColumnsType<Record<string, unknown>> | undefined,
  parentFullKey?: string,
  path: string[] = [],
): string {
  if (!columns?.length) return '';
  const parts: string[] = [];
  (columns as ColumnTypeAny[]).forEach((col, i) => {
    const full = colKey(col, i);
    if (isInternalColumnKey(full)) return;
    const configId = parentFullKey ? shortChildId(parentFullKey, full) : full;
    const nextPath = [...path, configId];
    if (col.children?.length) {
      const sub = columnsLeafPathSignature(
        col.children as ColumnsType<Record<string, unknown>>,
        full,
        nextPath,
      );
      if (sub) parts.push(sub);
      return;
    }
    parts.push(nextPath.join('/'));
  });
  return parts.join('\0');
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
    // 父 hidden 时级联子树，避免「父隐子显」的脏持久化态
    const nextChildren =
      hidden && children?.length ? children.map((c) => cascadePanelHidden(c, true)) : children;
    return {
      id: src.id,
      title: src.title,
      label: src.label,
      hidden,
      children: nextChildren,
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

/** 面板项整棵子树打 hidden（加载已存 config 时与 toggle 级联对齐） */
function cascadePanelHidden(item: ColumnConfigPanelItem, hidden: boolean): ColumnConfigPanelItem {
  return {
    ...item,
    hidden,
    children: item.children?.map((c) => cascadePanelHidden(c, hidden)),
  };
}

export function splitVisibleHidden(items: ColumnConfigPanelItem[]): {
  visible: ColumnConfigPanelItem[];
  hidden: ColumnConfigPanelItem[];
} {
  const visible = items.filter((it) => !it.hidden);
  const topHidden = items.filter((it) => it.hidden);
  const nestedHidden: ColumnConfigPanelItem[] = [];

  const walk = (nodes: ColumnConfigPanelItem[], pathLabels: string[]) => {
    for (const it of nodes) {
      if (it.hidden) {
        const pathLabel = [...pathLabels, it.label || it.id].join(' / ');
        nestedHidden.push({
          ...it,
          label: pathLabel,
          // 隐藏区扁平展示；子树已整体隐藏时保留 children 供展开，否则不再嵌套重复项
          children: it.children?.length ? it.children : undefined,
        });
        continue;
      }
      if (it.children?.length) {
        walk(it.children, [...pathLabels, it.label || it.id]);
      }
    }
  };

  // 仅从「仍显示的顶层」往下收二/三级隐藏项（顶层整棵隐藏已在 topHidden）
  for (const top of visible) {
    if (top.children?.length) {
      walk(top.children, [top.label || top.id]);
    }
  }

  return { visible, hidden: [...topHidden, ...nestedHidden] };
}
