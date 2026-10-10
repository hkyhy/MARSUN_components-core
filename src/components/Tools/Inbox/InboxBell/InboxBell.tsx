import { Badge, Button, Checkbox, Drawer, Space, message, notification } from 'antd';
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
import { SEMANTIC_COLORS, SemanticTag } from '@/components/Tag';
import { sanitizeInboxHtml } from '../sanitizeInboxHtml';
import { INBOX_BADGE_REFRESH_EVENT } from '../requestInboxBadgeRefresh';
import { emphasizeQuoted } from './emphasizeQuoted';
import {
  filterInboxActionsForHost,
  isInboxButtonDriven,
  resolveInboxItemActions,
  type InboxItemActionKind,
  type InboxItemQuickAction,
} from './inboxItemActions';
import {
  loadInboxToastPrefs,
  saveInboxToastPrefs,
  shouldToastForMessageType,
  type InboxToastPrefs,
} from './toastPrefs';
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
  /** 级别展示名（业务仓从已有维表/工具函数填；空则回落 level） */
  levelLabel?: string;
  /**
   * 级别 Tag 色：业务仓传入预警级别设置色（如 QA `ALERT_LEVEL_COLORS.*.accent`）。
   * 支持 SemanticColor 键或 `#hex`；core 不自造级别色表。
   */
  levelColor?: string;
  category?: string;
  scene?: string;
  eventKey?: string;
  categoryLabel?: string;
  alertId?: string | null;
  actionId?: string | null;
  claimed?: boolean;
  started?: boolean;
  /** 行动当前状态（enrich / contextJson）；终态时底栏只保留查看任务 */
  actionStatus?: string;
  factory?: string;
  variety?: string;
  metric?: string;
  /** 业务日/月份（如 2026-07-31）；预警深链 date 用 */
  month?: string;
};

export type InboxBellListResult = {
  pageData: InboxBellItem[];
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
  /**
   * 同源 SSE 路径（默认 `/api/v1/msg-center/inbox/stream`）。
   * 传 `false` 关闭。须配合 `getAccessToken`（EventSource 用 `access_token` 查询参数传 JWT）。
   * 失败回落写后刷新 / 焦点刷新，不定时轮询冒充。
   */
  streamPath?: string | false;
  /** 返回当前 JWT；空则不开 SSE */
  getAccessToken?: () => string | null | undefined;
  /**
   * 卡片底栏动作（认领/去执行/查看等）。不传则底栏按钮一律走 onNavigate / href。
   * 业务仓拦截 claim_alert / start_action；铃铛不解析新建任务。
   */
  onItemAction?: (kind: InboxItemActionKind, item: InboxBellItem) => void | Promise<void>;
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

function messageTypeSemanticColor(raw?: string): string {
  const key = String(raw || '')
    .trim()
    .toLowerCase();
  if (key === 'alert') return SEMANTIC_COLORS.DANGER;
  if (key === 'action') return SEMANTIC_COLORS.PRIMARY;
  if (key === 'remind') return SEMANTIC_COLORS.WARNING;
  return SEMANTIC_COLORS.DEFAULT;
}

function itemMetaLine(item: InboxBellItem): string {
  return [item.factory, item.variety, item.metric]
    .map((x) => String(x || '').trim())
    .filter(Boolean)
    .join(' · ');
}

/** 业务传入色；无则 DEFAULT（禁止在 core 造级别→色平行表） */
function resolveLevelTagColor(raw?: string): string {
  const c = String(raw || '').trim();
  return c || SEMANTIC_COLORS.DEFAULT;
}

type BadgePreview = {
  messageType?: string;
  title?: string;
  summary?: string;
};

function parseBadgePreview(raw: string): BadgePreview | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (!data || typeof data !== 'object') return null;
    const messageType = String(data.messageType || data.message_type || '').trim();
    const title = String(data.title || '').trim();
    const summary = String(data.summary || '').trim();
    if (!messageType && !title && !summary) return null;
    return {
      messageType: messageType || undefined,
      title: title || undefined,
      summary: summary || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * 通用站内信铃铛：列表 / 已读 / Tab / 角标 / 卡片底栏动作 / 可选 SSE toast。
 * 认领、去执行等业务动作由 `onItemAction` 注入；默认底栏按钮走 onNavigate / href。
 * 默认不定时轮询；有消息侧靠业务回调 / 路由 / 焦点 / 可选 SSE 再拉角标。
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
    streamPath = '/api/v1/msg-center/inbox/stream',
    getAccessToken,
    onItemAction,
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
  const [toastPrefs, setToastPrefs] = useState<InboxToastPrefs>(() => loadInboxToastPrefs());
  const focusDebounceRef = useRef<number | null>(null);
  const locationKeyPrimedRef = useRef(false);
  const toastPrefsRef = useRef(toastPrefs);
  toastPrefsRef.current = toastPrefs;

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
      setItems(res?.pageData || []);
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
    if (streamPath === false) return undefined;
    if (typeof getAccessToken !== 'function') return undefined;
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return undefined;

    const token = String(getAccessToken() || '').trim();
    if (!token) return undefined;

    const base = String(streamPath || '/api/v1/msg-center/inbox/stream').trim();
    const url = new URL(base, window.location.origin);
    url.searchParams.set('access_token', token);

    let es: EventSource;
    try {
      es = new EventSource(url.toString());
    } catch {
      return undefined;
    }

    const onBadge = (ev: Event) => {
      void refreshBadge();
      const msgEv = ev as MessageEvent;
      const preview = typeof msgEv?.data === 'string' ? parseBadgePreview(msgEv.data) : null;
      if (!preview) return;
      if (!shouldToastForMessageType(toastPrefsRef.current, preview.messageType)) return;
      const toastTitle = preview.title || '新站内信';
      const toastDesc = preview.summary || '';
      const typeLabel = messageTypeLabel(preview.messageType);
      const openDrawer = () => {
        notification.destroy();
        setOpen(true);
      };
      const toastKey = `inbox-badge-${preview.messageType || 'msg'}-${Date.now()}`;
      notification.open({
        key: toastKey,
        className: classNames('marsun-inbox-toast', styles.toastNotice),
        closable: true,
        title: (
          <div className={styles.toastHead}>
            <span className={styles.toastTitle}>{emphasizeQuoted(toastTitle)}</span>
            {typeLabel ? (
              <SemanticTag
                color={messageTypeSemanticColor(preview.messageType)}
                className={styles.typeTag}
              >
                {typeLabel}
              </SemanticTag>
            ) : null}
          </div>
        ),
        message: (
          <div className={styles.toastHead}>
            <span className={styles.toastTitle}>{emphasizeQuoted(toastTitle)}</span>
            {typeLabel ? (
              <SemanticTag
                color={messageTypeSemanticColor(preview.messageType)}
                className={styles.typeTag}
              >
                {typeLabel}
              </SemanticTag>
            ) : null}
          </div>
        ),
        description: (
          <div className={styles.toastBody}>
            {toastDesc ? (
              <div className={styles.toastDesc}>{emphasizeQuoted(toastDesc)}</div>
            ) : null}
            <div className={styles.toastActions}>
              <Button
                type="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  openDrawer();
                }}
              >
                查看
              </Button>
            </div>
          </div>
        ),
        placement: 'topRight',
        duration: 6,
        onClick: openDrawer,
      });
    };
    es.addEventListener('badge', onBadge);
    es.addEventListener('inbox', onBadge);
    // 失败回落写后/焦点刷新；关连接防 EventSource 自动重连刷屏
    es.onerror = () => {
      es.close();
    };

    return () => {
      es.removeEventListener('badge', onBadge);
      es.removeEventListener('inbox', onBadge);
      es.close();
    };
  }, [streamPath, getAccessToken, refreshBadge]);

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

  const updateToastPref = (key: keyof InboxToastPrefs, checked: boolean) => {
    setToastPrefs((prev) => {
      const next = { ...prev, [key]: checked };
      saveInboxToastPrefs(next);
      return next;
    });
  };

  const handleOpenItem = async (item: InboxBellItem, opts?: { skipRead?: boolean }) => {
    if (!opts?.skipRead && !item.read) {
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

  const runQuickAction = async (item: InboxBellItem, action: InboxItemQuickAction) => {
    if (action.disabled) return;
    if (onItemAction) {
      try {
        await onItemAction(action.kind, item);
        setOpen(false);
        void load();
        void refreshBadge();
      } catch (e) {
        message.error(e instanceof Error ? e.message : '操作失败');
      }
      return;
    }
    await handleOpenItem(item);
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
        <div className={styles.toastPrefs} data-testid="inbox-toast-prefs">
          <div className={styles.toastPrefsTitle}>消息提示</div>
          <p className={styles.toastPrefsHint}>本机浏览器偏好，非租户策略</p>
          <Space size={12} wrap>
            <Checkbox
              checked={toastPrefs.alert}
              onChange={(e) => updateToastPref('alert', e.target.checked)}
            >
              预警弹出
            </Checkbox>
            <Checkbox
              checked={toastPrefs.action}
              onChange={(e) => updateToastPref('action', e.target.checked)}
            >
              行动弹出
            </Checkbox>
            <Checkbox
              checked={toastPrefs.remind}
              onChange={(e) => updateToastPref('remind', e.target.checked)}
            >
              提醒弹出
            </Checkbox>
          </Space>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        <PageSpin spinning={loading}>
          {!loading && !error && items.length === 0 ? (
            <Empty description="暂无站内信" />
          ) : (
            <ul className={styles.list}>
              {items.map((item) => {
                const typeLabel = messageTypeLabel(item.messageType);
                const levelText = String(item.levelLabel || item.level || '').trim();
                const showLevel = Boolean(levelText);
                const safeHtml = sanitizeInboxHtml(item.bodyHtml);
                const actions = filterInboxActionsForHost(
                  resolveInboxItemActions(item),
                  Boolean(onItemAction),
                );
                const buttonDriven = isInboxButtonDriven(item);
                const meta = itemMetaLine(item);
                const showActions = Boolean(actions.primary);
                return (
                  <li key={item.id}>
                    <div
                      className={classNames(
                        styles.item,
                        !item.read && styles.itemUnread,
                        buttonDriven && styles.itemStatic,
                      )}
                      role={buttonDriven ? undefined : 'button'}
                      tabIndex={buttonDriven ? undefined : 0}
                      onClick={buttonDriven ? undefined : () => void handleOpenItem(item)}
                      onKeyDown={
                        buttonDriven
                          ? undefined
                          : (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                void handleOpenItem(item);
                              }
                            }
                      }
                    >
                      <div className={styles.itemHeader}>
                        <span className={styles.itemHeaderLeft}>
                          <span className={styles.itemTitle} title={item.title || '（无标题）'}>
                            {item.title || '（无标题）'}
                          </span>
                          {typeLabel ? (
                            <SemanticTag
                              color={messageTypeSemanticColor(item.messageType)}
                              className={styles.typeTag}
                            >
                              {typeLabel}
                            </SemanticTag>
                          ) : null}
                        </span>
                        <span className={styles.itemTime}>{item.createdAt || ''}</span>
                      </div>
                      <div className={styles.itemBody}>
                        {safeHtml ? (
                          <div
                            className={styles.itemBodyHtml}
                            dangerouslySetInnerHTML={{ __html: safeHtml }}
                          />
                        ) : item.summary ? (
                          <span className={styles.itemSummary}>
                            {emphasizeQuoted(item.summary)}
                          </span>
                        ) : null}
                      </div>
                      {meta ? <span className={styles.itemMeta}>{meta}</span> : null}
                      {showLevel ? (
                        <div className={styles.itemFooterTags}>
                          <SemanticTag
                            color={resolveLevelTagColor(item.levelColor)}
                            className={styles.typeTag}
                          >
                            {levelText}
                          </SemanticTag>
                        </div>
                      ) : null}
                      {showActions && actions.primary ? (
                        <div
                          className={styles.itemActions}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <Space size={8} wrap>
                            <Button
                              size="small"
                              type="primary"
                              onClick={() => void runQuickAction(item, actions.primary!)}
                            >
                              {actions.primary.label}
                            </Button>
                            {actions.secondary ? (
                              <Button
                                size="small"
                                type="link"
                                onClick={() => void runQuickAction(item, actions.secondary!)}
                              >
                                {actions.secondary.label}
                              </Button>
                            ) : null}
                          </Space>
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </PageSpin>
      </Drawer>
    </div>
  );
});

export default InboxBell;
export {
  DEFAULT_INBOX_TOAST_PREFS,
  loadInboxToastPrefs,
  saveInboxToastPrefs,
  shouldToastForMessageType,
} from './toastPrefs';
export type { InboxToastPrefs } from './toastPrefs';
export {
  resolveInboxItemActions,
  resolveInboxSceneKey,
  filterInboxActionsForHost,
  normalizeInboxActions,
  inboxSceneLabel,
  isInboxButtonDriven,
  isTerminalActionStatus,
} from './inboxItemActions';
export type {
  InboxItemActionKind,
  InboxItemQuickAction,
  InboxItemActionsResolved,
} from './inboxItemActions';
