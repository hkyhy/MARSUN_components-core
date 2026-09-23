/** 站内信角标：外部（业务写成功 / AppShell）触发刷新的事件名 */
export const INBOX_BADGE_REFRESH_EVENT = 'marsun-msg-center:refresh-badge';

/**
 * 请求刷新 InboxBell 未读角标（window CustomEvent）。
 * 铃铛未挂载时无副作用；挂载实例会监听并 refreshBadge。
 */
export function requestInboxBadgeRefresh(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(INBOX_BADGE_REFRESH_EVENT));
}

/** 业务写成功后：立即 + 单次延迟补刷（盖 async outbox；非轮询） */
export function requestInboxBadgeRefreshAfterWrite(delayMs = 1200): void {
  requestInboxBadgeRefresh();
  if (typeof window === 'undefined') return;
  window.setTimeout(() => {
    requestInboxBadgeRefresh();
  }, delayMs);
}
