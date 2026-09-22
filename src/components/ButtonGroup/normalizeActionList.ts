/**
 * 操作组 list 项：无权限或不可再操作 → hidden，禁止用 disabled 占位「已认领」类文案。
 * `unavailable` 为业务态门禁（态到了不可再点）；`hidden` 为权限等显隐。
 * 短暂 loading 仍用 `disabled` / `loading`，勿标 `unavailable`。
 */
export type ActionListItem = Record<string, unknown> & {
  children?: React.ReactNode;
  hidden?: boolean;
  /** 业务态不可再操作 → 与 hidden 一并视为不渲染 */
  unavailable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (...args: never[]) => unknown;
  type?: string;
  size?: string;
};

export type NormalizeActionListOptions = {
  /**
   * 默认 true：`unavailable` 合并进 `hidden`，且不再向下游传 `unavailable`。
   * 设为 false 时原样透传（仅调试/逃生）。
   */
  hideUnavailable?: boolean;
};

/**
 * 规范化 ButtonGroup `list`：不可用项隐藏，不置灰占位。
 */
export function normalizeActionList<T extends ActionListItem | ((...args: never[]) => unknown)>(
  list: T[] | null | undefined,
  options?: NormalizeActionListOptions,
): T[] {
  const hideUnavailable = options?.hideUnavailable !== false;
  if (!Array.isArray(list) || list.length === 0) return [];

  return list.map((item) => {
    if (typeof item === 'function') return item;
    const row = item as ActionListItem;
    const { unavailable, hidden, ...rest } = row;
    if (!hideUnavailable) {
      return item;
    }
    const nextHidden = Boolean(hidden) || unavailable === true;
    return { ...rest, hidden: nextHidden } as T;
  });
}

export type ActionListItemInput = Omit<ActionListItem, 'hidden' | 'unavailable'> & {
  /** 有对应 EP / 角色；false → hidden */
  can?: boolean;
  /** 业务态仍可操作；false → unavailable→hidden */
  available?: boolean;
};

/** 构造单条操作：无权限或不可再操作 → hidden（不写 disabled 占位） */
export function actionListItem(input: ActionListItemInput): ActionListItem {
  const { can = true, available = true, ...rest } = input;
  return {
    ...rest,
    hidden: !can || !available,
  };
}
