import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InboxBell from '../InboxBell/InboxBell';
import { INBOX_BADGE_REFRESH_EVENT, requestInboxBadgeRefresh } from '../requestInboxBadgeRefresh';

describe('InboxBell poll / refresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('pollMs<=0 不启动定时轮询；挂载仍刷一次角标', async () => {
    const fetchInbox = vi.fn(async () => ({
      itemList: [],
      unreadTotal: 0,
      unreadByMessageType: {},
    }));
    const markRead = vi.fn(async () => undefined);
    const setIntervalSpy = vi.spyOn(window, 'setInterval');

    render(<InboxBell fetchInbox={fetchInbox} markRead={markRead} pollMs={0} />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(fetchInbox).toHaveBeenCalledTimes(1);
    expect(fetchInbox).toHaveBeenCalledWith({ currentPage: 1, pageSize: 1 });
    expect(setIntervalSpy).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(120_000);
      await Promise.resolve();
    });
    expect(fetchInbox).toHaveBeenCalledTimes(1);
  });

  it('pollMs>0 会定时刷角标', async () => {
    const fetchInbox = vi.fn(async () => ({
      itemList: [],
      unreadTotal: 0,
      unreadByMessageType: {},
    }));
    const markRead = vi.fn(async () => undefined);

    render(<InboxBell fetchInbox={fetchInbox} markRead={markRead} pollMs={5_000} />);

    await act(async () => {
      await Promise.resolve();
    });
    expect(fetchInbox).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(5_000);
      await Promise.resolve();
    });
    expect(fetchInbox.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('requestInboxBadgeRefresh 事件触发 refreshBadge', async () => {
    const fetchInbox = vi.fn(async () => ({
      itemList: [],
      unreadTotal: 1,
      unreadByMessageType: { action: 1 },
    }));
    const markRead = vi.fn(async () => undefined);

    render(<InboxBell fetchInbox={fetchInbox} markRead={markRead} pollMs={0} />);

    await act(async () => {
      await Promise.resolve();
    });
    const afterMount = fetchInbox.mock.calls.length;

    await act(async () => {
      requestInboxBadgeRefresh();
      await Promise.resolve();
    });
    expect(fetchInbox.mock.calls.length).toBe(afterMount + 1);
    expect(INBOX_BADGE_REFRESH_EVENT).toBe('marsun-msg-center:refresh-badge');
  });
});
