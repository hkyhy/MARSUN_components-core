/** 消息受众槽位 — 与 mc catalog `audienceSlotOptions` 对齐（中文 label / 存码）；禁 FE 另造平行表。 */
export type AudienceSlotOption = {
  value: string;
  label: string;
};

export const AUDIENCE_SLOT_OPTIONS: AudienceSlotOption[] = [
  { value: 'task.assigner', label: '分配任务的人' },
  { value: 'task.assignee', label: '接受/被分配任务的人' },
  { value: 'task.claimer', label: '认领人' },
  { value: 'task.reporter', label: '发起/提报人' },
  { value: 'party.self', label: '本人' },
  { value: 'party.self_and_manager', label: '本人及直属领导' },
  { value: 'org.department', label: '本部门' },
  { value: 'org.factory', label: '本分厂' },
  { value: 'org.tenant', label: '本租户（全公司）' },
];

export const ORG_TENANT_SLOT = 'org.tenant';

export function normalizeAudienceSlots(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const allow = new Set(AUDIENCE_SLOT_OPTIONS.map((o) => o.value));
  const out: string[] = [];
  for (const x of raw) {
    const s = String(x || '').trim();
    if (s && allow.has(s) && !out.includes(s)) out.push(s);
  }
  return out;
}

/** 保存门禁：roles ∪ slots ∪ userIds 至少一个 */
export function hasAudienceSelection(opts: {
  roles?: string[] | null;
  slots?: string[] | null;
  userIds?: string[] | null;
}): boolean {
  const roles = (opts.roles || []).filter((x) => String(x || '').trim());
  const slots = normalizeAudienceSlots(opts.slots || []);
  const userIds = (opts.userIds || []).filter((x) => String(x || '').trim());
  return roles.length > 0 || slots.length > 0 || userIds.length > 0;
}
