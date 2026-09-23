import type { ActionPersonCascadeOption } from './types';

/** 在级联中查找 userId 对应路径 [roleCode, userId]；可选 preferRole 优先该角色枝 */
export function findPersonCascadePath(
  options: ActionPersonCascadeOption[],
  userId: string,
  preferRole?: string,
): string[] | undefined {
  const uid = String(userId || '').trim();
  if (!uid) return undefined;
  const prefer = String(preferRole || '').trim();

  if (prefer) {
    for (const role of options) {
      const roleCode = String(role.value || '');
      if (roleCode !== prefer) continue;
      for (const child of role.children || []) {
        if (String(child.value || '') === uid) return [roleCode, uid];
      }
    }
  }

  for (const role of options) {
    const roleCode = String(role.value || '');
    for (const child of role.children || []) {
      if (String(child.value || '') === uid) return [roleCode, uid];
    }
  }
  return undefined;
}

/** 当前路径是否仍有效且叶子为该 userId */
export function cascadePathStillValid(
  options: ActionPersonCascadeOption[],
  path: string[] | undefined,
  userId: string,
): boolean {
  const uid = String(userId || '').trim();
  if (!uid || !path || path.length < 2) return false;
  if (String(path[path.length - 1] || '') !== uid) return false;
  const roleCode = String(path[0] || '');
  const role = options.find((r) => String(r.value || '') === roleCode);
  return Boolean(role?.children?.some((c) => String(c.value || '') === uid));
}
