/** 站内信角标：外部（业务写成功 / AppShell）触发刷新的事件名 */
export const INBOX_BADGE_REFRESH_EVENT = 'marsun-msg-center:refresh-badge';

/** 业务写后可附带预览，铃铛在 SSE 未达时仍可弹 toast */
export type InboxBadgeRefreshDetail = {
  preview?: {
    messageType?: string;
    title?: string;
    summary?: string;
  } | null;
};

/**
 * 请求刷新 InboxBell 未读角标（window CustomEvent）。
 * 铃铛未挂载时无副作用；挂载实例会监听并 refreshBadge。
 * `detail.preview` 有值时按偏好弹出站内信 toast（不依赖 SSE）。
 */
export function requestInboxBadgeRefresh(detail?: InboxBadgeRefreshDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(INBOX_BADGE_REFRESH_EVENT, { detail: detail || {} }));
}

/** 业务写成功后：立即 + 单次延迟补刷（盖 async outbox；非轮询） */
export function requestInboxBadgeRefreshAfterWrite(
  delayMs = 1200,
  detail?: InboxBadgeRefreshDetail,
): void {
  requestInboxBadgeRefresh(detail);
  if (typeof window === 'undefined') return;
  window.setTimeout(() => {
    requestInboxBadgeRefresh();
  }, delayMs);
}
