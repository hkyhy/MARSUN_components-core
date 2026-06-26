/** 值或基于上下文的函数 */
export type MaybeFn<T, Ctx = Record<string, unknown>> = T | ((ctx: Ctx) => T);

/** 可见性：boolean 或函数式 */
export type Visibility = MaybeFn<boolean>;

/**
 * 解析 MaybeFn 值
 * display 与 hidden 互斥时：display 优先；均未传则默认展示
 */
export function resolveMaybeFn<T, Ctx = Record<string, unknown>>(
  value: MaybeFn<T, Ctx> | undefined,
  ctx: Ctx,
  fallback: T,
): T {
  if (value === undefined) return fallback;
  return typeof value === 'function' ? (value as (ctx: Ctx) => T)(ctx) : value;
}

/** 根据 display / hidden 计算是否可见 */
export function resolveVisible(
  display: Visibility | undefined,
  hidden: Visibility | undefined,
  ctx: Record<string, unknown> = {},
): boolean {
  if (display !== undefined) {
    return resolveMaybeFn(display, ctx, true);
  }
  if (hidden !== undefined) {
    return !resolveMaybeFn(hidden, ctx, false);
  }
  return true;
}
