import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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
    cleanup();
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
        return { pageData: [], unreadTotal: 1, unreadByMessageType: { action: 1 } };
      }
      return {
        pageData: [
          {
            id: 'm1',
            title: '您有新任务',
            summary: '请尽快处理',
            messageType: 'action',
            category: 'action_assigned',
            actionId: 'a1',
            createdAt: '2026-10-09 12:00',
            read: false,
            href: '/actions?actionId=a1',
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
    expect(screen.getByText('去执行')).toBeTruthy();
    expect(screen.getByText('2026-10-09 12:00')).toBeTruthy();
    expect(screen.getByText('请尽快处理')).toBeTruthy();
    expect(screen.getByText('本机浏览器偏好，非租户策略')).toBeTruthy();
  });

  it('Drawer 可改偏好并写入 localStorage', async () => {
    const fetchInbox = vi.fn(async () => ({
      pageData: [],
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
      pageData: [],
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
      message: unknown;
      description: unknown;
      className?: string;
      actions?: unknown;
      onClick?: () => void;
    };
    expect(String(arg.className || '')).toContain('marsun-inbox-toast');
    expect(arg.message).toBeTruthy();
    expect(arg.description).toBeTruthy();
    expect(arg.title || arg.message).toBeTruthy();

    await act(async () => {
      arg.onClick?.();
      await Promise.resolve();
    });
    expect(screen.getAllByText('本机浏览器偏好，非租户策略').length).toBeGreaterThan(0);
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
      pageData: [],
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

  it('预警卡片展示级别 Tag；认领到期展示去认领', async () => {
    const fetchInbox = vi.fn(async (params: { pageSize?: number }) => {
      if (params.pageSize === 1) {
        return { pageData: [], unreadTotal: 2 };
      }
      return {
        pageData: [
          {
            id: 'a1',
            title: '巡检预警标题',
            summary: '回潮率超标',
            messageType: 'alert',
            category: 'inspect_alert',
            level: 'L3',
            levelLabel: '双超',
            levelColor: '#f5222d',
            createdAt: '2026-09-18 18:33:08',
            read: false,
            href: '/alerts',
          },
          {
            id: 'r1',
            title: '认领到期标题',
            summary: '仍未认领',
            messageType: 'remind',
            category: 'claim_due',
            level: 'L3',
            levelLabel: '双超',
            levelColor: '#f5222d',
            createdAt: '2026-09-18 18:33:08',
            read: false,
            href: '/alerts',
          },
        ],
        unreadTotal: 2,
      };
    });

    render(
      <InboxBell
        fetchInbox={fetchInbox}
        markRead={async () => undefined}
        pollMs={0}
        streamPath={false}
      />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.click(screen.getByLabelText(/站内信/));
    await act(async () => {
      await Promise.resolve();
    });

    expect(await screen.findByText('巡检预警标题')).toBeTruthy();
    expect(screen.getAllByText('预警').length).toBeGreaterThan(0);
    expect(screen.getAllByText('双超').length).toBeGreaterThan(0);
    expect(screen.getByText('去认领')).toBeTruthy();
    expect(screen.getByText('查看预警')).toBeTruthy();
  });

  it('滚到底加载下一页（pageData 追加）', async () => {
    const all = Array.from({ length: 25 }, (_, i) => ({
      id: `p-${i + 1}`,
      title: `消息 ${i + 1}`,
      summary: `s${i + 1}`,
      messageType: 'action' as const,
      read: true,
      href: '/actions',
    }));
    const fetchInbox = vi.fn(async (params: { currentPage?: number; pageSize?: number }) => {
      const size = params.pageSize ?? 20;
      const page = params.currentPage ?? 1;
      const start = (page - 1) * size;
      return {
        pageData: all.slice(start, start + size),
        total: all.length,
        unreadTotal: 0,
        unreadByMessageType: {},
      };
    });

    render(
      <InboxBell
        fetchInbox={fetchInbox}
        markRead={async () => undefined}
        pollMs={0}
        streamPath={false}
        pageSize={10}
      />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.click(screen.getByLabelText(/站内信/));
    expect(await screen.findByText('消息 1')).toBeTruthy();
    expect(screen.queryByText('消息 11')).toBeNull();

    const viewport = screen.getByTestId('inbox-bell-list-scroll');
    Object.defineProperty(viewport, 'scrollHeight', { configurable: true, value: 800 });
    Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: 400 });
    Object.defineProperty(viewport, 'scrollTop', { configurable: true, value: 740 });
    await act(async () => {
      fireEvent.scroll(viewport);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(await screen.findByText('消息 11')).toBeTruthy();
    const pages = fetchInbox.mock.calls.map((c) => c[0]?.currentPage);
    expect(pages).toContain(2);
  });
});
