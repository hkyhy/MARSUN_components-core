/** 行上判定「执行」所需的最小字段 */
export type ActionExecuteGateRow = {
  status?: string | null;
  assigneeUserId?: string | null;
};

export type ActionExecuteGateOptions = {
  /** 是否持有行动执行权限 */
  canExecute: boolean;
  /** 当前登录用户 SSO userId；可空（未登录则凡有执行人的行均 hidden） */
  currentUserId?: string | null;
};

/**
 * 行动跟踪操作列「执行」是否 hidden（EAM/S3 通用）。
 * - 仅 approved + 有执行权
 * - assigneeUserId 空：可显示（开始时认领）
 * - 已有执行人：仅本人可见
 */
export function isActionExecuteHidden(
  row: ActionExecuteGateRow,
  options: ActionExecuteGateOptions,
): boolean {
  if (!options.canExecute) return true;
  if (String(row.status || '').trim() !== 'approved') return true;
  const assigneeUserId = String(row.assigneeUserId || '').trim();
  if (!assigneeUserId) return false;
  const uid = String(options.currentUserId || '').trim();
  if (!uid) return true;
  return assigneeUserId !== uid;
}
