import type { MessageAudienceUserOption } from '../MessageTemplateAdmin/types';

/** 按 id 去重合并；用于分页追加与已选回显保留（保持 base 顺序，新 id 追加在后） */
export function mergeAudienceUsers(
  base: MessageAudienceUserOption[],
  extra: MessageAudienceUserOption[],
): MessageAudienceUserOption[] {
  const map = new Map<string, MessageAudienceUserOption>();
  for (const u of base) {
    if (u?.id) map.set(u.id, u);
  }
  for (const u of extra) {
    if (u?.id && !map.has(u.id)) map.set(u.id, u);
  }
  return [...map.values()];
}

export type AudienceUserSelectOption = {
  value: string;
  label: string;
  /** 副文案：部门 · 角色 · 工号 */
  description?: string;
  /** 搜索用拼接串 */
  searchText: string;
};

function optionDescription(u: MessageAudienceUserOption): string {
  const parts: string[] = [];
  const dept = String(u.departmentName || '').trim();
  const roles = String(u.roleNames || '').trim();
  const emp = String(u.employeeId || '').trim();
  if (dept) parts.push(dept);
  if (roles) parts.push(roles);
  if (emp) parts.push(`工号 ${emp}`);
  return parts.join(' · ');
}

/**
 * 扁平 options，保持传入顺序（对接 listUsers 分页追加到底）。
 * 部门写在 description，不再 OptGroup 重排。
 */
export function buildAudienceUserSelectOptions(
  users: MessageAudienceUserOption[],
): AudienceUserSelectOption[] {
  const out: AudienceUserSelectOption[] = [];
  for (const u of users) {
    if (!u?.id) continue;
    const description = optionDescription(u);
    const label = String(u.name || u.id);
    out.push({
      value: u.id,
      label,
      description: description || undefined,
      searchText: [label, description, u.departmentName, u.employeeId, u.roleNames]
        .filter(Boolean)
        .join(' '),
    });
  }
  return out;
}

/** @deprecated 改用 buildAudienceUserSelectOptions（扁平 + description 含部门） */
export function buildAudienceUserSelectGroups(
  users: MessageAudienceUserOption[],
): { label: string; title: string; options: AudienceUserSelectOption[] }[] {
  return [
    {
      label: '人员',
      title: '人员',
      options: buildAudienceUserSelectOptions(users),
    },
  ];
}
