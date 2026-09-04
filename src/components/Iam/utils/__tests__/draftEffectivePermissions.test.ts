import { describe, expect, it } from 'vitest';
import { buildDraftEffectivePermissions } from '../draftEffectivePermissions';

describe('buildDraftEffectivePermissions', () => {
  const roles = [
    {
      id: 'r1',
      code: 'ADMIN',
      rolePermissions: [
        { permission: { code: 'sys:demo-agent', name: '进入', layer: 'SYSTEM' } },
        { permission: { code: 'app:menu:home', name: '首页', layer: 'BUSINESS' } },
      ],
    },
  ];
  const groups = [
    {
      id: 'g1',
      groupRoles: [{ role: { id: 'r1', code: 'ADMIN' } }],
    },
  ];

  it('updates when role selection changes', () => {
    expect(
      buildDraftEffectivePermissions({
        roleCodes: [],
        groupIds: [],
        roles,
        groups,
      }),
    ).toEqual([]);
    const withRole = buildDraftEffectivePermissions({
      roleCodes: ['ADMIN'],
      groupIds: [],
      roles,
      groups,
    });
    expect(withRole.map((p) => p.code)).toContain('app:menu:home');
  });

  it('merges groupRoles', () => {
    const out = buildDraftEffectivePermissions({
      roleCodes: [],
      groupIds: ['g1'],
      roles,
      groups,
    });
    expect(out.map((p) => p.code).sort()).toEqual(['app:menu:home', 'sys:demo-agent']);
  });
});
