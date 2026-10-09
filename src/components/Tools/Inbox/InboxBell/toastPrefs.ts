/** 本机浏览器站内信弹出偏好（非租户策略）。 */

export type InboxToastMessageType = 'alert' | 'action' | 'remind';

export type InboxToastPrefs = Record<InboxToastMessageType, boolean>;

export const INBOX_TOAST_PREFS_KEY = 'marsun-inbox-bell-toast-prefs';

/** 默认：预警/行动弹出，提醒仅角标 */
export const DEFAULT_INBOX_TOAST_PREFS: InboxToastPrefs = {
  alert: true,
  action: true,
  remind: false,
};

export function normalizeInboxToastPrefs(raw: unknown): InboxToastPrefs {
  const base = { ...DEFAULT_INBOX_TOAST_PREFS };
  if (!raw || typeof raw !== 'object') return base;
  const o = raw as Record<string, unknown>;
  for (const k of ['alert', 'action', 'remind'] as const) {
    if (typeof o[k] === 'boolean') base[k] = o[k];
  }
  return base;
}

export function loadInboxToastPrefs(): InboxToastPrefs {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_INBOX_TOAST_PREFS };
  }
  try {
    const raw = window.localStorage.getItem(INBOX_TOAST_PREFS_KEY);
    if (!raw) return { ...DEFAULT_INBOX_TOAST_PREFS };
    return normalizeInboxToastPrefs(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_INBOX_TOAST_PREFS };
  }
}

export function saveInboxToastPrefs(prefs: InboxToastPrefs): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(
      INBOX_TOAST_PREFS_KEY,
      JSON.stringify(normalizeInboxToastPrefs(prefs)),
    );
  } catch {
    /* quota / private mode：忽略 */
  }
}

export function shouldToastForMessageType(
  prefs: InboxToastPrefs,
  messageType: string | undefined | null,
): boolean {
  const key = String(messageType || '')
    .trim()
    .toLowerCase();
  if (key === 'alert' || key === 'action' || key === 'remind') {
    return Boolean(prefs[key]);
  }
  // 未知类型：不弹，只刷角标
  return false;
}
