import type { MessageAudienceUserOption } from '../MessageTemplateAdmin/types';

const UNASSIGNED_DEPT = '未分配部门';

export type AudienceUserSelectOption = {
  value: string;
  label: string;
  /** 副文案：角色 · 工号 */
  description?: string;
  /** 搜索用拼接串 */
  searchText: string;
};

export type AudienceUserSelectGroup = {
  label: string;
  title: string;
  options: AudienceUserSelectOption[];
};

function optionDescription(u: MessageAudienceUserOption): string {
  const parts: string[] = [];
  const roles = String(u.roleNames || '').trim();
  const emp = String(u.employeeId || '').trim();
  if (roles) parts.push(roles);
  if (emp) parts.push(`工号 ${emp}`);
  return parts.join(' · ');
}

/** 按部门 OptGroup；组内按展示名排序。禁 FE 造中文平行表，部门名取自 SSO orgs。 */
export function buildAudienceUserSelectGroups(
  users: MessageAudienceUserOption[],
): AudienceUserSelectGroup[] {
  const byDept = new Map<string, MessageAudienceUserOption[]>();
  for (const u of users) {
    if (!u?.id) continue;
    const dept = String(u.departmentName || '').trim() || UNASSIGNED_DEPT;
    const bucket = byDept.get(dept);
    if (bucket) bucket.push(u);
    else byDept.set(dept, [u]);
  }
  const deptNames = [...byDept.keys()].sort((a, b) => {
    if (a === UNASSIGNED_DEPT) return 1;
    if (b === UNASSIGNED_DEPT) return -1;
    return a.localeCompare(b, 'zh-CN');
  });
  return deptNames.map((dept) => {
    const list = (byDept.get(dept) || [])
      .slice()
      .sort((a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id), 'zh-CN'));
    return {
      label: dept,
      title: dept,
      options: list.map((u) => {
        const description = optionDescription(u);
        const label = String(u.name || u.id);
        return {
          value: u.id,
          label,
          description: description || undefined,
          searchText: [label, description, dept, u.employeeId, u.roleNames]
            .filter(Boolean)
            .join(' '),
        };
      }),
    };
  });
}
