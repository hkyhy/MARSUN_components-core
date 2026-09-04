/**
 * 用户权限弹层：按「当前勾选」的角色/共享组合并草稿 EP（未保存预览）。
 * 不含岗位/直绑；与 SSO getEffectivePermissions 保存后结果可能略有差异。
 */

export type DraftEpPerm = { code: string; name: string; layer?: string };

type RoleLike = {
  id: string;
  code: string;
  rolePermissions?: {
    permissionId?: string;
    permission?: { id?: string; code?: string; name?: string; layer?: string } | null;
  }[];
};

type GroupLike = {
  id: string;
  moduleAccess?: { moduleKey: string; access: 'read' | 'write' }[] | null;
  groupRoles?: { role?: { id?: string; code?: string; name?: string } | null }[];
};

function addPerm(
  map: Map<string, DraftEpPerm>,
  code: string,
  name?: string | null,
  layer?: string | null,
) {
  const c = (code || '').trim();
  if (!c || map.has(c)) return;
  map.set(c, {
    code: c,
    name: (name || '').trim() || c,
    layer: layer || undefined,
  });
}

function absorbRole(map: Map<string, DraftEpPerm>, role: RoleLike | undefined) {
  if (!role) return;
  for (const rp of role.rolePermissions || []) {
    const p = rp.permission;
    if (p?.code) addPerm(map, p.code, p.name, p.layer);
  }
}

export function buildDraftEffectivePermissions(input: {
  roleCodes: string[];
  groupIds: string[];
  roles: RoleLike[];
  groups: GroupLike[];
  expandModuleAccess?: (rows: { moduleKey: string; access: 'read' | 'write' }[]) => string[];
  nameByCode?: Record<string, string>;
}): DraftEpPerm[] {
  const byCode = new Map(input.roles.map((r) => [r.code, r]));
  const byId = new Map(input.roles.map((r) => [r.id, r]));
  const map = new Map<string, DraftEpPerm>();

  for (const code of input.roleCodes) {
    absorbRole(map, byCode.get(code));
  }

  for (const gid of input.groupIds) {
    const g = input.groups.find((x) => x.id === gid);
    if (!g) continue;
    for (const gr of g.groupRoles || []) {
      const role =
        (gr.role?.id ? byId.get(gr.role.id) : undefined) ||
        (gr.role?.code ? byCode.get(gr.role.code) : undefined);
      absorbRole(map, role);
    }
    if (input.expandModuleAccess && g.moduleAccess?.length) {
      for (const code of input.expandModuleAccess(g.moduleAccess)) {
        addPerm(map, code, input.nameByCode?.[code]);
      }
    }
  }

  for (const [code, row] of map) {
    const labeled = input.nameByCode?.[code];
    if (labeled && (!row.name || row.name === code)) {
      map.set(code, { ...row, name: labeled });
    }
  }

  return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
}
