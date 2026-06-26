/** 通过 Provider 注入的 hasPermission 回调检查权限 */
export function hasPermission(
  check: ((permission: string) => boolean) | undefined,
  perm: string,
): boolean {
  if (!check) return false;
  return check(perm);
}
