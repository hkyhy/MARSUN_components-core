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
  /** 已渲染 HTML；Showcase / 对齐 mc bodyHtml */
  bodyHtml?: string;
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
    bodyTemplate:
      '<p><strong>加粗</strong> · 业务日 {{bizDate}} · 共 {{count}} 台</p><ul><li>一厂</li><li>细纱001</li></ul><p><span style="color:#c00">请关注缺口</span></p>',
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

export type MsgPushRuleItem = {
  id: string;
  code: string;
  label: string;
  eventKey: string;
  templateCode: string;
  levels: string[];
  audienceRoles: string[];
  channels: string[];
  slaHours: number;
  scanLookbackDays: number;
  enabled: boolean;
};

const MSG_PUSH_SEED: MsgPushRuleItem[] = [
  {
    id: 'pr-energy',
    code: 'pr_energy_gap',
    label: '用能缺口推送',
    eventKey: 'energy.gap',
    templateCode: 'energy_gap_default',
    levels: ['L2'],
    audienceRoles: ['EQUIPMENT_ADMIN'],
    channels: ['in_app'],
    slaHours: 36,
    scanLookbackDays: 7,
    enabled: true,
  },
];

let templates = structuredClone(MSG_TEMPLATES_SEED);
let pushRules = structuredClone(MSG_PUSH_SEED);
let tenantVars: MsgVariableItem[] = [];
let inbox: MsgInboxItem[] = [];
let seq = 1;

export function resetMsgCenterFixture() {
  templates = structuredClone(MSG_TEMPLATES_SEED);
  pushRules = structuredClone(MSG_PUSH_SEED);
  tenantVars = [];
  inbox = [];
  seq = 1;
}

export function listFixtureEvents() {
  return [...MSG_EVENTS];
}

type CatalogVariableRow = MsgVariableItem & {
  source: 'catalog' | 'tenant';
  baseline?: boolean;
};

/** 完整 catalog payload（events + variables/contextSchema）；Admin Demo 须用此，禁只回 events 数组 */
export function listFixtureCatalog() {
  const merged: CatalogVariableRow[] = MSG_VARIABLES.map((v) => ({
    ...v,
    source: 'catalog' as const,
  }));
  for (const tv of tenantVars) {
    const i = merged.findIndex((x) => x.key === tv.key);
    const row: CatalogVariableRow = { ...tv, source: 'tenant', baseline: i >= 0 };
    if (i >= 0) merged[i] = row;
    else merged.push(row);
  }
  return {
    events: [...MSG_EVENTS],
    contextSchema: { ...MSG_CONTEXT_SCHEMA },
    variables: merged,
  };
}

export function listFixturePushRules() {
  return [...pushRules];
}

export function saveFixturePushRule(item: Partial<MsgPushRuleItem> & { eventKey: string }) {
  const id = item.id || `pr-${seq++}`;
  const next: MsgPushRuleItem = {
    id,
    code: item.code || `pr_${id}`,
    label: item.label || item.eventKey,
    eventKey: item.eventKey,
    templateCode: item.templateCode || '',
    levels: item.levels || ['L2'],
    audienceRoles: item.audienceRoles || [],
    channels: item.channels || ['in_app'],
    slaHours: item.slaHours ?? 36,
    scanLookbackDays: item.scanLookbackDays ?? 7,
    enabled: item.enabled !== false,
  };
  const idx = pushRules.findIndex((t) => t.id === id);
  if (idx >= 0) pushRules[idx] = next;
  else pushRules.push(next);
  return next;
}

export function setFixturePushRuleEnabled(id: string, enabled: boolean) {
  pushRules = pushRules.map((t) => (t.id === id ? { ...t, enabled } : t));
}

export function deleteFixturePushRule(id: string) {
  pushRules = pushRules.filter((t) => t.id !== id);
}

export function listFixtureVariablesAdmin() {
  return listFixtureCatalog().variables;
}

export function saveFixtureVariable(item: MsgVariableItem & { source?: string }) {
  const key = String(item.key || '').trim();
  if (!key) throw new Error('key 必填');
  const idx = tenantVars.findIndex((v) => v.key === key);
  const row = { key, label: item.label, type: item.type || 'string' };
  if (idx >= 0) tenantVars[idx] = row;
  else tenantVars.push(row);
  return { ...row, source: 'tenant' as const };
}

export function deleteFixtureVariable(key: string) {
  if (MSG_VARIABLES.some((v) => v.key === key)) {
    throw new Error(`禁止删除 catalog 基线变量：${key}`);
  }
  tenantVars = tenantVars.filter((v) => v.key !== key);
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
  const fillKeepHtml = (s: string) =>
    s
      .replace(/\{\{(\w+)\}\}/g, (_, k: string) => (vars[k] != null ? String(vars[k]) : ''))
      .replace(/(?<!\{)\{(\w+)\}(?!\})/g, (_, k: string) =>
        vars[k] != null ? String(vars[k]) : '',
      );
  const stripTags = (s: string) =>
    s
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n+/g, ' ')
      .trim();
  const title = fillKeepHtml(tpl.titleTemplate)
    .replace(/<[^>]+>/g, '')
    .trim();
  const bodyHtml = fillKeepHtml(tpl.bodyTemplate);
  const summary = stripTags(bodyHtml);
  const href = ev?.defaultHref || '/';
  const row: MsgInboxItem = {
    id: `inbox-${seq++}`,
    title,
    summary,
    bodyHtml,
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
    bodyHtml,
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
