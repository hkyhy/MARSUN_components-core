import { Badge, Button, Drawer, Space, Tag, message } from 'antd';
import classNames from 'classnames';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Empty } from '@/components/Empty';
import { Bell } from '@/components/Icons';
import { PageSpin } from '@/components/Layout';
import { SegmentedRadio } from '@/components/SegmentedRadio';
import { StateBar } from '@/components/StateBar';
import { sanitizeInboxHtml } from '../sanitizeInboxHtml';
import { INBOX_BADGE_REFRESH_EVENT } from '../requestInboxBadgeRefresh';
import styles from './style.module.scss';

export type InboxBellMessageType = 'alert' | 'action' | 'remind' | string;

export type InboxBellItem = {
  id: string;
  title?: string;
  /** 纯文本摘要（列表兼容） */
  summary?: string;
  /** 已渲染 HTML 正文；空则主摘要位回落 summary */
  bodyHtml?: string | null;
  read?: boolean;
  messageType?: InboxBellMessageType;
  href?: string;
  createdAt?: string;
  level?: string;
};

export type InboxBellListResult = {
  itemList: InboxBellItem[];
  total?: number;
  unreadTotal?: number;
  unreadByMessageType?: Partial<Record<string, number>>;
};

export type InboxBellListParams = {
  unreadOnly?: boolean;
  readOnly?: boolean;
  messageType?: InboxBellMessageType;
  currentPage?: number;
  pageSize?: number;
};

export type InboxBellProps = {
  /** 拉取站内信（业务注入；须带 JWT 身份，禁止无身份全表） */
  fetchInbox: (params: InboxBellListParams) => Promise<InboxBellListResult>;
  /** 标记已读 */
  markRead: (id: string) => Promise<void | InboxBellItem>;
  /** 点击条目：默认用 window.location / 业务 navigate */
  onNavigate?: (href: string, item: InboxBellItem) => void;
  /**
   * 轮询未读角标（ms）。默认 `0`（关定时）；`>0` 才 setInterval。
   * 角标另由：挂载首刷、`locationKey`、focus/visibility、`requestInboxBadgeRefresh` 触发。
   */
  pollMs?: number;
  /**
   * 路由/页面身份；变化时刷新角标（如 React Router `location.pathname`）。
   * 整页加载靠挂载首刷，不必另传。
   */
  locationKey?: string | number;
  pageSize?: number;
  className?: string;
  /** Drawer 标题 */
  title?: string;
};

export type InboxBellHandle = {
  refreshBadge: () => Promise<void>;
};

const TYPE_TABS: Array<{ key: string; label: string }> = [
  { key: '', label: '全部' },
  { key: 'alert', label: '预警' },
  { key: 'action', label: '行动' },
  { key: 'remind', label: '提醒' },
];

const TYPE_TAG_LABEL: Record<string, string> = {
  alert: '预警',
  action: '行动',
  remind: '提醒',
};

const FOCUS_DEBOUNCE_MS = 300;

function messageTypeLabel(raw?: string): string {
  const key = String(raw || '')
    .trim()
    .toLowerCase();
  if (!key) return '';
  return TYPE_TAG_LABEL[key] || key;
}

/**
 * 通用站内信铃铛：列表 / 已读 / Tab / 角标。
 * 不含认领、行动等业务动作；由注入的 fetchInbox / markRead / onNavigate 对接消息服务。
 * 默认不定时轮询；有消息侧靠业务回调 / 路由 / 焦点再拉角标（真·SSE push 他窗）。
 */
const InboxBell = forwardRef<InboxBellHandle, InboxBellProps>(function InboxBell(
  {
    fetchInbox,
    markRead,
    onNavigate,
    pollMs = 0,
    locationKey,
    pageSize = 50,
    className,
    title = '站内信',
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<InboxBellItem[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [unreadByType, setUnreadByType] = useState<Partial<Record<string, number>>>({});
  const [messageType, setMessageType] = useState<string>('');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const focusDebounceRef = useRef<number | null>(null);
  const locationKeyPrimedRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchInbox({
        currentPage: 1,
        pageSize,
        messageType: messageType || undefined,
        unreadOnly: readFilter === 'unread' || undefined,
        readOnly: readFilter === 'read' || undefined,
      });
      setItems(res?.itemList || []);
      setUnreadTotal(typeof res?.unreadTotal === 'number' ? res.unreadTotal : 0);
      setUnreadByType(res?.unreadByMessageType || {});
    } catch (e) {
      setItems([]);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [fetchInbox, messageType, pageSize, readFilter]);

  const refreshBadge = useCallback(async () => {
    try {
      const res = await fetchInbox({ currentPage: 1, pageSize: 1 });
      setUnreadTotal(typeof res?.unreadTotal === 'number' ? res.unreadTotal : 0);
      setUnreadByType(res?.unreadByMessageType || {});
    } catch {
      /* 角标失败不打断 UI */
    }
  }, [fetchInbox]);

  useImperativeHandle(ref, () => ({ refreshBadge }), [refreshBadge]);

  useEffect(() => {
    void refreshBadge();
  }, [refreshBadge]);

  useEffect(() => {
    if (locationKey === undefined) return;
    // 挂载首刷已由 refreshBadge effect 覆盖；仅后续路由变化再拉
    if (!locationKeyPrimedRef.current) {
      locationKeyPrimedRef.current = true;
      return;
    }
    void refreshBadge();
  }, [locationKey, refreshBadge]);

  useEffect(() => {
    if (pollMs <= 0) return undefined;
    const t = window.setInterval(() => {
      void refreshBadge();
    }, pollMs);
    return () => window.clearInterval(t);
  }, [pollMs, refreshBadge]);

  useEffect(() => {
    const schedule = () => {
      if (focusDebounceRef.current != null) {
        window.clearTimeout(focusDebounceRef.current);
      }
      focusDebounceRef.current = window.setTimeout(() => {
        focusDebounceRef.current = null;
        void refreshBadge();
      }, FOCUS_DEBOUNCE_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') schedule();
    };

    window.addEventListener('focus', schedule);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', schedule);
      document.removeEventListener('visibilitychange', onVisibility);
      if (focusDebounceRef.current != null) {
        window.clearTimeout(focusDebounceRef.current);
        focusDebounceRef.current = null;
      }
    };
  }, [refreshBadge]);

  useEffect(() => {
    const onExternal = () => {
      void refreshBadge();
    };
    window.addEventListener(INBOX_BADGE_REFRESH_EVENT, onExternal);
    return () => window.removeEventListener(INBOX_BADGE_REFRESH_EVENT, onExternal);
  }, [refreshBadge]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const typeTabOptions = useMemo(
    () =>
      TYPE_TABS.map((t) => {
        const n = t.key ? unreadByType[t.key] || 0 : unreadTotal;
        return {
          key: t.key || 'all',
          label: n > 0 ? `${t.label} (${n})` : t.label,
        };
      }),
    [unreadByType, unreadTotal],
  );

  const handleOpenItem = async (item: InboxBellItem) => {
    if (!item.read) {
      try {
        await markRead(item.id);
        setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, read: true } : x)));
        setUnreadTotal((n) => Math.max(0, n - 1));
      } catch (e) {
        message.error(e instanceof Error ? e.message : '标记已读失败');
        return;
      }
    }
    const href = String(item.href || '').trim();
    if (!href) return;
    if (onNavigate) {
      onNavigate(href, item);
      setOpen(false);
      return;
    }
    if (href.startsWith('http://') || href.startsWith('https://')) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.assign(href);
    }
    setOpen(false);
  };

  return (
    <div className={classNames(styles.bellWrap, className)}>
      <Badge count={unreadTotal} size="small" overflowCount={99} offset={[-4, 4]}>
        <Button
          type="text"
          className={styles.bellBtn}
          icon={<Bell size={16} aria-hidden />}
          aria-label={unreadTotal > 0 ? `站内信，${unreadTotal} 条未读` : '站内信'}
          onClick={() => setOpen(true)}
        />
      </Badge>
      <Drawer
        title={title}
        open={open}
        onClose={() => setOpen(false)}
        size={420}
        destroyOnClose={false}
        className={styles.drawer}
        styles={{
          header: { padding: '12px 16px' },
          body: { padding: '12px 16px' },
        }}
      >
        <StateBar
          className={styles.typeTabs}
          size="small"
          activeKey={messageType || 'all'}
          onChange={(k) => setMessageType(k === 'all' ? '' : k)}
          stateOption={typeTabOptions}
          isInner
        />
        <div className={styles.filterRow}>
          <SegmentedRadio<'all' | 'unread' | 'read'>
            size="small"
            value={readFilter}
            onChange={(v) => setReadFilter(v)}
            options={[
              { value: 'all', label: '全部' },
              { value: 'unread', label: '未读' },
              { value: 'read', label: '已读' },
            ]}
          />
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        <PageSpin spinning={loading}>
          {!loading && !error && items.length === 0 ? (
            <Empty description="暂无站内信" />
          ) : (
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={classNames(styles.item, !item.read && styles.itemUnread)}
                    onClick={() => void handleOpenItem(item)}
                  >
                    <Space orientation="vertical" size={2} style={{ width: '100%' }}>
                      <span className={styles.itemTitle}>{item.title || '（无标题）'}</span>
                      {(() => {
                        const safeHtml = sanitizeInboxHtml(item.bodyHtml);
                        if (safeHtml) {
                          return (
                            <div
                              className={styles.itemBodyHtml}
                              dangerouslySetInnerHTML={{ __html: safeHtml }}
                            />
                          );
                        }
                        return item.summary ? (
                          <span className={styles.itemSummary}>{item.summary}</span>
                        ) : null;
                      })()}
                      {(() => {
                        const typeLabel = messageTypeLabel(item.messageType);
                        return (
                          <span className={styles.itemMeta}>
                            {typeLabel ? <Tag className={styles.typeTag}>{typeLabel}</Tag> : null}
                            {item.createdAt || (typeLabel ? '' : '—')}
                          </span>
                        );
                      })()}
                    </Space>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </PageSpin>
      </Drawer>
    </div>
  );
});

export default InboxBell;
