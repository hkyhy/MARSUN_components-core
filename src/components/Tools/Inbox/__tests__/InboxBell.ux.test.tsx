import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InboxBell from '../InboxBell/InboxBell';
import {
  DEFAULT_INBOX_TOAST_PREFS,
  INBOX_TOAST_PREFS_KEY,
  loadInboxToastPrefs,
  normalizeInboxToastPrefs,
  shouldToastForMessageType,
} from '../InboxBell/toastPrefs';

const notificationOpen = vi.fn();
const notificationDestroy = vi.fn();

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    notification: {
      ...actual.notification,
      open: (...args: unknown[]) => notificationOpen(...args),
      destroy: (...args: unknown[]) => notificationDestroy(...args),
    },
  };
});

function ensureLocalStorage() {
  const store = new Map<string, string>();
  const ls = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
  Object.defineProperty(window, 'localStorage', { value: ls, configurable: true });
}

describe('InboxBell UX / toast prefs', () => {
  beforeEach(() => {
    ensureLocalStorage();
    window.localStorage.clear();
    notificationOpen.mockReset();
    notificationDestroy.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('默认偏好：alert/action 弹、remind 不弹', () => {
    expect(DEFAULT_INBOX_TOAST_PREFS).toEqual({ alert: true, action: true, remind: false });
    expect(shouldToastForMessageType(DEFAULT_INBOX_TOAST_PREFS, 'alert')).toBe(true);
    expect(shouldToastForMessageType(DEFAULT_INBOX_TOAST_PREFS, 'remind')).toBe(false);
    expect(normalizeInboxToastPrefs({ remind: true }).remind).toBe(true);
  });

  it('卡片头：标题+类型左、时间右；SemanticTag 分色类存在', async () => {
    const fetchInbox = vi.fn(async (params: { pageSize?: number }) => {
      if (params.pageSize === 1) {
        return { itemList: [], unreadTotal: 1, unreadByMessageType: { action: 1 } };
      }
      return {
        itemList: [
          {
            id: 'm1',
            title: '您有新任务',
            summary: '请尽快处理',
            messageType: 'action',
            createdAt: '2026-10-09 12:00',
            read: false,
          },
        ],
        unreadTotal: 1,
        unreadByMessageType: { action: 1 },
      };
    });
    const markRead = vi.fn(async () => undefined);

    render(<InboxBell fetchInbox={fetchInbox} markRead={markRead} pollMs={0} streamPath={false} />);

    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.click(screen.getByLabelText(/站内信/));

    await act(async () => {
      await Promise.resolve();
    });

    expect(await screen.findByText('您有新任务')).toBeTruthy();
    expect(screen.getByText('行动')).toBeTruthy();
    expect(screen.getByText('2026-10-09 12:00')).toBeTruthy();
    expect(screen.getByText('请尽快处理')).toBeTruthy();
    expect(screen.getByText('本机浏览器偏好，非租户策略')).toBeTruthy();
  });

  it('Drawer 可改偏好并写入 localStorage', async () => {
    const fetchInbox = vi.fn(async () => ({
      itemList: [],
      unreadTotal: 0,
      unreadByMessageType: {},
    }));
    const markRead = vi.fn(async () => undefined);

    render(<InboxBell fetchInbox={fetchInbox} markRead={markRead} pollMs={0} streamPath={false} />);

    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.click(screen.getByLabelText(/站内信/));
    await act(async () => {
      await Promise.resolve();
    });

    const prefs = await screen.findByTestId('inbox-toast-prefs');
    const remind = within(prefs).getByText('提醒弹出');
    fireEvent.click(remind);

    await act(async () => {
      await Promise.resolve();
    });

    const stored = JSON.parse(window.localStorage.getItem(INBOX_TOAST_PREFS_KEY) || '{}');
    expect(stored.remind).toBe(true);
    expect(loadInboxToastPrefs().remind).toBe(true);
  });

  it('SSE badge 带预览且偏好允许 → notification.open 纯文本；点击打开 Drawer', async () => {
    const listeners: Record<string, (ev: MessageEvent) => void> = {};
    class FakeES {
      url: string;
      onerror: (() => void) | null = null;
      constructor(url: string) {
        this.url = url;
      }
      addEventListener(type: string, cb: (ev: MessageEvent) => void) {
        listeners[type] = cb;
      }
      removeEventListener() {}
      close() {}
    }
    vi.stubGlobal('EventSource', FakeES as unknown as typeof EventSource);

    const fetchInbox = vi.fn(async () => ({
      itemList: [],
      unreadTotal: 0,
      unreadByMessageType: {},
    }));
    const markRead = vi.fn(async () => undefined);

    render(
      <InboxBell
        fetchInbox={fetchInbox}
        markRead={markRead}
        pollMs={0}
        getAccessToken={() => 'tok'}
        streamPath="/api/v1/msg-center/inbox/stream"
      />,
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(listeners.badge).toBeTypeOf('function');

    await act(async () => {
      listeners.badge(
        new MessageEvent('badge', {
          data: JSON.stringify({
            type: 'badge',
            delta: 1,
            messageType: 'action',
            title: '您有新任务',
            summary: '李四你好：请尽快处理',
          }),
        }),
      );
      await Promise.resolve();
    });

    expect(notificationOpen).toHaveBeenCalled();
    const arg = notificationOpen.mock.calls[0][0] as {
      message: string;
      description: string;
      onClick?: () => void;
    };
    expect(arg.message).toBe('您有新任务');
    expect(arg.description).toBe('李四你好：请尽快处理');
    expect(String(arg.message)).not.toContain('<');

    await act(async () => {
      arg.onClick?.();
      await Promise.resolve();
    });
    expect(screen.getByText('本机浏览器偏好，非租户策略')).toBeTruthy();
  });

  it('SSE 无预览字段 → 只刷角标不弹 toast', async () => {
    const listeners: Record<string, (ev: MessageEvent) => void> = {};
    class FakeES {
      addEventListener(type: string, cb: (ev: MessageEvent) => void) {
        listeners[type] = cb;
      }
      removeEventListener() {}
      close() {}
    }
    vi.stubGlobal('EventSource', FakeES as unknown as typeof EventSource);

    const fetchInbox = vi.fn(async () => ({
      itemList: [],
      unreadTotal: 0,
      unreadByMessageType: {},
    }));

    render(
      <InboxBell
        fetchInbox={fetchInbox}
        markRead={async () => undefined}
        pollMs={0}
        getAccessToken={() => 'tok'}
      />,
    );

    await act(async () => {
      await Promise.resolve();
    });
    const afterMount = fetchInbox.mock.calls.length;

    await act(async () => {
      listeners.badge(
        new MessageEvent('badge', {
          data: JSON.stringify({ type: 'badge', delta: 1, messageIds: ['x'] }),
        }),
      );
      await Promise.resolve();
    });

    expect(fetchInbox.mock.calls.length).toBeGreaterThan(afterMount);
    expect(notificationOpen).not.toHaveBeenCalled();
  });
});
