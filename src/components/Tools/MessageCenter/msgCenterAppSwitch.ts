/**
 * 消息中心运行时 appKey 切换（Phase B）。
 * Hub 写入；各业务 App 铃铛/Admin 读取。跨页签用 sessionStorage + storage 事件。
 * 禁 Hub=全 Agent；仅 catalog 可切换对。
 */

export const MSG_CENTER_APP_SWITCH_STORAGE_KEY = 'marsun.msgCenter.currentAppKey';

/** SystemApp.code → mc catalog appKey（非中文表；仅 Quality 例外） */
export const SYSTEM_APP_TO_MSG_CENTER_APP_KEY: Readonly<Record<string, string>> = {
  'equipment-agent': 'equipment-agent',
  's3-agent': 's3-quality',
};

/** 本期允许出现在切换器中的 mc appKey */
export const MSG_CENTER_SWITCHABLE_APP_KEYS = ['equipment-agent', 's3-quality'] as const;

export type MsgCenterSwitchableAppKey = (typeof MSG_CENTER_SWITCHABLE_APP_KEYS)[number];

export type MsgCenterAppSwitchState = {
  currentAppKey: string;
  currentSystemAppCode: string;
  currentSystemAppName: string;
};

export type MsgCenterSwitchableApp = {
  appKey: string;
  systemAppCode: string;
  name: string;
};

type Listener = (appKey: string) => void;

const listeners = new Set<Listener>();

function readStorage(): string {
  if (typeof sessionStorage === 'undefined') return '';
  try {
    return String(sessionStorage.getItem(MSG_CENTER_APP_SWITCH_STORAGE_KEY) || '').trim();
  } catch {
    return '';
  }
}

function writeStorage(appKey: string): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(MSG_CENTER_APP_SWITCH_STORAGE_KEY, appKey);
  } catch {
    /* ignore quota */
  }
}

function notify(appKey: string): void {
  listeners.forEach((fn) => {
    try {
      fn(appKey);
    } catch {
      /* listener error 不阻断 */
    }
  });
}

/** 从 SystemApp.code 解析 mc appKey；未知则原样返回（调用方须再过滤） */
export function msgCenterAppKeyFromSystemAppCode(systemAppCode: string): string {
  const code = String(systemAppCode || '').trim();
  if (!code) return '';
  return SYSTEM_APP_TO_MSG_CENTER_APP_KEY[code] || code;
}

/**
 * 仅保留本期可切换且用户有权进入的项（禁全量 Agent）。
 * `apps` 须已是「有权进入」子集（由 Hub 用 EP 过滤后再传入）。
 */
export function filterMsgCenterSwitchableApps(
  apps: Array<{ code: string; name: string }>,
): MsgCenterSwitchableApp[] {
  const out: MsgCenterSwitchableApp[] = [];
  const seen = new Set<string>();
  for (const raw of apps) {
    const systemAppCode = String(raw?.code || '').trim();
    const name = String(raw?.name || '').trim() || systemAppCode;
    if (!systemAppCode) continue;
    const appKey = msgCenterAppKeyFromSystemAppCode(systemAppCode);
    if (!(MSG_CENTER_SWITCHABLE_APP_KEYS as readonly string[]).includes(appKey)) continue;
    if (seen.has(appKey)) continue;
    seen.add(appKey);
    out.push({ appKey, systemAppCode, name });
  }
  return out;
}

export function getMsgCenterAppKey(fallbackAppKey: string): string {
  const fromStore = readStorage();
  if (fromStore) return fromStore;
  return String(fallbackAppKey || '').trim();
}

export function setMsgCenterAppKey(appKey: string, allowed?: readonly string[]): void {
  const next = String(appKey || '').trim();
  if (!next) return;
  if (allowed && allowed.length > 0 && !allowed.includes(next)) {
    throw new Error(`appKey 不在可切换列表：${next}`);
  }
  writeStorage(next);
  notify(next);
}

export function subscribeMsgCenterAppKey(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 浏览器多页签：storage 事件（仅跨 tab；同页靠 subscribe） */
export function bindMsgCenterAppKeyStorageSync(): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onStorage = (ev: StorageEvent) => {
    if (ev.storageArea !== sessionStorage) return;
    if (ev.key !== MSG_CENTER_APP_SWITCH_STORAGE_KEY) return;
    notify(String(ev.newValue || '').trim());
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

export function resolveMsgCenterSwitchState(
  apps: MsgCenterSwitchableApp[],
  fallbackAppKey: string,
): MsgCenterAppSwitchState {
  const currentAppKey = getMsgCenterAppKey(fallbackAppKey);
  const hit = apps.find((a) => a.appKey === currentAppKey);
  if (hit) {
    return {
      currentAppKey: hit.appKey,
      currentSystemAppCode: hit.systemAppCode,
      currentSystemAppName: hit.name,
    };
  }
  const fb = apps.find((a) => a.appKey === fallbackAppKey) || apps[0];
  return {
    currentAppKey: fb?.appKey || fallbackAppKey,
    currentSystemAppCode: fb?.systemAppCode || fallbackAppKey,
    currentSystemAppName: fb?.name || fallbackAppKey,
  };
}
