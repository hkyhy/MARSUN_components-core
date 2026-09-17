/**
 * MessageCenter showcase 共享 fixture（内存，形状对齐 msg_center 契约）。
 * 仅供 demos / 单测；业务 App 禁止当运行时 mock。
 */
export type MsgEventItem = {
  eventKey: string;
  label: string;
  defaultHref?: string;
};

export type MsgTemplateItem = {
  id: string;
  code: string;
  eventKey: string;
  scenario: string;
  messageType: string;
  titleTemplate: string;
  bodyTemplate: string;
  audienceRoles: string[];
  enabled: boolean;
  channel: string;
};

export type MsgInboxItem = {
  id: string;
  title: string;
  summary: string;
  messageType: string;
  read: boolean;
  href: string;
  createdAt: string;
  eventKey?: string;
};

export type MsgRoleItem = { code: string; name: string };

export type MsgVariableItem = { key: string; label?: string; type?: string };

/** 对齐 equipment-agent catalog contextSchema（Showcase SSOT；禁 FE DEFAULT_VARS 平行表） */
export const MSG_CONTEXT_SCHEMA: Record<string, { type: string; label: string }> = {
  factory: { type: 'string', label: '分厂' },
  machine: { type: 'string', label: '机台' },
  machineId: { type: 'string', label: '机台ID' },
  bizDate: { type: 'string', label: '业务日' },
  count: { type: 'number', label: '台数' },
  metric: { type: 'string', label: '指标' },
  gapPct: { type: 'number', label: '缺口%' },
};

export const MSG_VARIABLES: MsgVariableItem[] = Object.entries(MSG_CONTEXT_SCHEMA).map(
  ([key, meta]) => ({ key, type: meta.type, label: meta.label }),
);

export const MSG_EVENTS: MsgEventItem[] = [
  {
    eventKey: 'energy.gap',
    label: '用能缺口巡检',
    defaultHref: '/energy',
  },
  {
    eventKey: 'maintenance.overdue',
    label: '保养超期',
    defaultHref: '/maintenance',
  },
];

/** 展示名来自角色 name；code 写入 audienceRoles */
export const MSG_ROLES: MsgRoleItem[] = [
  { code: 'EQUIPMENT_ADMIN', name: '设备管理员' },
  { code: 'EQUIPMENT_OPERATOR', name: '设备运营员' },
  { code: 'EQUIPMENT_VIEWER', name: '普通用户' },
];

export const MSG_TEMPLATES_SEED: MsgTemplateItem[] = [
  {
    id: 'tpl-energy',
    code: 'energy_gap_default',
    eventKey: 'energy.gap',
    scenario: '用能缺口汇总',
    messageType: 'alert',
    titleTemplate: '用能缺口巡检命中',
    bodyTemplate: '<p>业务日 {{bizDate}} · 共 {{count}} 台</p>',
    audienceRoles: ['EQUIPMENT_ADMIN'],
    enabled: true,
    channel: 'in_app',
  },
  {
    id: 'tpl-maint',
    code: 'maint_overdue_default',
    eventKey: 'maintenance.overdue',
    scenario: '保养超期提醒',
    messageType: 'remind',
    titleTemplate: '保养超期提醒',
    bodyTemplate: '<p>机台 {{machineId}} 已超期</p>',
    audienceRoles: ['EQUIPMENT_ADMIN'],
    enabled: false,
    channel: 'in_app',
  },
];

let templates = structuredClone(MSG_TEMPLATES_SEED);
let inbox: MsgInboxItem[] = [];
let seq = 1;

export function resetMsgCenterFixture() {
  templates = structuredClone(MSG_TEMPLATES_SEED);
  inbox = [];
  seq = 1;
}

export function listFixtureEvents() {
  return [...MSG_EVENTS];
}

/** 完整 catalog payload（events + variables/contextSchema）；Admin Demo 须用此，禁只回 events 数组 */
export function listFixtureCatalog() {
  return {
    events: [...MSG_EVENTS],
    contextSchema: { ...MSG_CONTEXT_SCHEMA },
    variables: MSG_VARIABLES.map((v) => ({ ...v })),
  };
}

export function listFixtureRoles() {
  return [...MSG_ROLES];
}

export function listFixtureTemplates() {
  return [...templates];
}

export function saveFixtureTemplate(item: Partial<MsgTemplateItem> & { eventKey: string }) {
  const id = item.id || `tpl-${seq++}`;
  const next: MsgTemplateItem = {
    id,
    code: item.code || `code_${id}`,
    eventKey: item.eventKey,
    scenario: item.scenario || item.eventKey,
    messageType: item.messageType || 'alert',
    titleTemplate: item.titleTemplate || item.scenario || '标题',
    bodyTemplate: item.bodyTemplate || item.titleTemplate || '',
    audienceRoles: item.audienceRoles || ['EQUIPMENT_ADMIN'],
    enabled: item.enabled === true,
    channel: item.channel || 'in_app',
  };
  const idx = templates.findIndex((t) => t.id === id);
  if (idx >= 0) templates[idx] = next;
  else templates.push(next);
  return next;
}

export function setFixtureTemplateEnabled(id: string, enabled: boolean) {
  templates = templates.map((t) => (t.id === id ? { ...t, enabled } : t));
}

/** dryRun / emit：按 eventKey 找启用模板，写入 inbox */
export function emitFixtureByEventKey(
  eventKey: string,
  vars: Record<string, string> = {},
  opts?: { dryRun?: boolean },
) {
  const tpl = templates.find((t) => t.eventKey === eventKey && t.enabled);
  if (!tpl) {
    throw new Error(`无启用模板：${eventKey}`);
  }
  const ev = MSG_EVENTS.find((e) => e.eventKey === eventKey);
  const fill = (s: string) =>
    s
      .replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? `{{${k}}}`)
      .replace(/(?<!\{)\{(\w+)\}(?!\})/g, (_, k: string) => vars[k] ?? `{${k}}`)
      .replace(/<[^>]+>/g, '');
  const title = fill(tpl.titleTemplate);
  const summary = fill(tpl.bodyTemplate);
  const href = ev?.defaultHref || '/';
  const row: MsgInboxItem = {
    id: `inbox-${seq++}`,
    title,
    summary,
    messageType: tpl.messageType,
    read: false,
    href,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    eventKey,
  };
  if (!opts?.dryRun) {
    inbox = [row, ...inbox];
  }
  return {
    dryRun: Boolean(opts?.dryRun),
    title,
    summary,
    href,
    recipientCount: 1,
    message: row,
  };
}

export function listFixtureInbox() {
  return [...inbox];
}

export function markFixtureInboxRead(id: string) {
  inbox = inbox.map((x) => (x.id === id ? { ...x, read: true } : x));
}

export function countFixtureExamplesMetaMin() {
  return 6;
}
