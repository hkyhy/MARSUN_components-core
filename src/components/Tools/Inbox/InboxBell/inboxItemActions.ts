export type InboxItemActionKind =
  | 'view_alert'
  | 'claim_alert'
  | 'start_action'
  | 'view_task'
  | 'create_task'
  | 'open_actions'
  | 'view_rca'
  | 'view_href';

export type InboxItemQuickAction = {
  kind: InboxItemActionKind;
  label: string;
  /** 解析中间态用；渲染前会被 normalize 丢掉，禁止灰显占位 */
  disabled?: boolean;
};

export type InboxItemActionsResolved = {
  primary?: InboxItemQuickAction;
  secondary?: InboxItemQuickAction;
};

export type InboxItemActionSource = {
  category?: string | null;
  scene?: string | null;
  eventKey?: string | null;
  messageType?: string | null;
  alertId?: string | null;
  actionId?: string | null;
  claimed?: boolean;
  started?: boolean;
  /** 行动项当前状态：approved/in_progress/done/reviewed/cancelled 等 */
  actionStatus?: string | null;
  href?: string | null;
};

const SCENE_LABEL: Record<string, string> = {
  inspect_alert: '巡检预警',
  claim_due: '认领到期',
  claim_overdue: '认领到期',
  dispose_escalation: '处置升级',
  action_overdue: '行动超期',
  action_assigned: '任务分配',
  action_status_changed: '状态变更',
  action_claimed: '任务认领',
  action_followed: '任务跟进',
  l3_parallel: 'L3并行',
};

const SCENE_ALIAS: Record<string, string> = {
  'alert.inspect': 'inspect_alert',
  'remind.claim_due': 'claim_due',
  'action.overdue': 'action_overdue',
  'action.assigned': 'action_assigned',
  'action.status_changed': 'action_status_changed',
  'action.status': 'action_status_changed',
  'action.due_soon': 'action_overdue',
  'action.claimed': 'action_claimed',
  'action.followed': 'action_followed',
};

const TERMINAL_STATUS = new Set(['done', 'reviewed', 'cancelled', 'closed']);

function canonScene(raw?: string | null): string {
  const c = String(raw || '')
    .trim()
    .toLowerCase();
  if (!c) return '';
  if (SCENE_LABEL[c]) return c;
  if (SCENE_ALIAS[c]) return SCENE_ALIAS[c];
  const underscored = c.replace(/\./g, '_');
  if (SCENE_LABEL[underscored]) return underscored;
  return c;
}

export function resolveInboxSceneKey(item: InboxItemActionSource): string {
  return canonScene(item.category) || canonScene(item.scene) || canonScene(item.eventKey);
}

export function inboxSceneLabel(item: InboxItemActionSource): string {
  const key = resolveInboxSceneKey(item);
  if (!key) return '';
  return SCENE_LABEL[key] || '';
}

export function isInboxButtonDriven(item: InboxItemActionSource): boolean {
  const c = resolveInboxSceneKey(item);
  return (
    c === 'claim_due' ||
    c === 'claim_overdue' ||
    c === 'action_overdue' ||
    c === 'action_assigned' ||
    c === 'action_status_changed' ||
    c === 'action_claimed' ||
    c === 'action_followed' ||
    c === 'inspect_alert'
  );
}

function normStatus(raw?: string | null): string {
  return String(raw || '')
    .trim()
    .toLowerCase();
}

export function isTerminalActionStatus(status?: string | null): boolean {
  return TERMINAL_STATUS.has(normStatus(status));
}

function isActionMessage(n: InboxItemActionSource, scene: string): boolean {
  const mt = String(n.messageType || '')
    .trim()
    .toLowerCase();
  if (mt === 'action') return true;
  return (
    scene.startsWith('action_') ||
    scene === 'action_overdue' ||
    scene === 'action_assigned' ||
    scene === 'action_status_changed' ||
    scene === 'action_claimed' ||
    scene === 'action_followed'
  );
}

function viewTaskOrHref(n: InboxItemActionSource, actionId: string): InboxItemActionsResolved {
  if (actionId) return { primary: { kind: 'view_task', label: '查看任务' } };
  if (String(n.href || '').trim()) return { primary: { kind: 'view_href', label: '查看' } };
  return { primary: { kind: 'open_actions', label: '查看任务' } };
}

/**
 * 解析卡片底栏动作。
 * 约定：禁用态不返回（由 normalize 再保险）；终态任务只给「查看任务」。
 */
export function resolveInboxItemActions(n: InboxItemActionSource): InboxItemActionsResolved {
  const c = resolveInboxSceneKey(n);
  const actionId = String(n.actionId || '').trim();
  const alertId = String(n.alertId || '').trim();
  const status = normStatus(n.actionStatus);
  const terminal = isTerminalActionStatus(status);
  const started =
    Boolean(n.started) ||
    terminal ||
    status === 'in_progress' ||
    c === 'action_followed' ||
    c === 'action_claimed';
  const claimed = Boolean(n.claimed) || Boolean(actionId) || c === 'action_claimed';

  if (c === 'claim_due' || c === 'claim_overdue') {
    if (claimed) {
      return actionId
        ? { primary: { kind: 'view_task', label: '查看任务' } }
        : { primary: { kind: 'view_alert', label: '查看预警' } };
    }
    return { primary: { kind: 'claim_alert', label: '去认领' } };
  }

  // 已认领 / 已跟进 / 状态变更：只看任务（勿落「查看预警」）
  if (c === 'action_claimed' || c === 'action_followed' || c === 'action_status_changed') {
    return viewTaskOrHref(n, actionId);
  }

  if (c === 'action_overdue' || c === 'action_assigned') {
    if (terminal || started) {
      return viewTaskOrHref(n, actionId);
    }
    if (!actionId) {
      return String(n.href || '').trim() ? { primary: { kind: 'view_href', label: '查看' } } : {};
    }
    return { primary: { kind: 'start_action', label: '去执行' } };
  }

  if (c === 'dispose_escalation') {
    if (actionId) {
      return {
        primary: { kind: 'view_task', label: '查看任务' },
        secondary: alertId ? { kind: 'view_alert', label: '查看预警' } : undefined,
      };
    }
    return {
      primary: { kind: 'view_alert', label: '查看预警' },
      secondary: { kind: 'open_actions', label: '去任务跟踪' },
    };
  }

  if (c.startsWith('rca') || c === 'rca_approved') {
    return { primary: { kind: 'view_rca', label: '查看根因' } };
  }

  if (c === 'inspect_alert' || c === 'l3_parallel') {
    if (actionId) {
      return {
        primary: { kind: 'view_alert', label: '查看预警' },
        secondary: { kind: 'view_task', label: '查看任务' },
      };
    }
    return {
      primary: { kind: 'view_alert', label: '查看预警' },
      secondary: { kind: 'create_task', label: '新建任务' },
    };
  }

  // 行动类消息（含历史 category 空）：优先任务，禁止误用「查看预警」
  if (isActionMessage(n, c)) {
    if (terminal || started || c === 'action_claimed') {
      return viewTaskOrHref(n, actionId);
    }
    if (actionId) {
      return { primary: { kind: 'start_action', label: '去执行' } };
    }
    return viewTaskOrHref(n, actionId);
  }

  if (alertId) {
    if (actionId) {
      return {
        primary: { kind: 'view_alert', label: '查看预警' },
        secondary: { kind: 'view_task', label: '查看任务' },
      };
    }
    return {
      primary: { kind: 'view_alert', label: '查看预警' },
      secondary: { kind: 'create_task', label: '新建任务' },
    };
  }

  if (actionId) {
    if (terminal || started) return { primary: { kind: 'view_task', label: '查看任务' } };
    return { primary: { kind: 'start_action', label: '去执行' } };
  }

  if (String(n.href || '').trim()) {
    return { primary: { kind: 'view_href', label: '查看' } };
  }

  return {};
}

/** 去掉 disabled；主按钮空时把次按钮升格；统一主/次语义 */
export function normalizeInboxActions(
  resolved: InboxItemActionsResolved,
): InboxItemActionsResolved {
  const usable = (a?: InboxItemQuickAction) =>
    a && !a.disabled ? { ...a, disabled: undefined } : undefined;
  let primary = usable(resolved.primary);
  let secondary = usable(resolved.secondary);
  if (!primary && secondary) {
    primary = secondary;
    secondary = undefined;
  }
  if (primary && secondary && primary.kind === secondary.kind) {
    secondary = undefined;
  }
  return { primary, secondary };
}

/** 无业务 onItemAction 时不展示「新建任务」（会误跳 href） */
export function filterInboxActionsForHost(
  resolved: InboxItemActionsResolved,
  hasItemAction: boolean,
): InboxItemActionsResolved {
  const base = normalizeInboxActions(resolved);
  if (hasItemAction) return base;
  const dropCreate = (a?: InboxItemQuickAction) => (a && a.kind === 'create_task' ? undefined : a);
  let primary = dropCreate(base.primary);
  let secondary = dropCreate(base.secondary);
  if (!primary && secondary) {
    primary = secondary;
    secondary = undefined;
  }
  return { primary, secondary };
}
