import { describe, expect, it } from 'vitest';
import type { ActionPersonCascadeOption } from '../types';
import { cascadePathStillValid, findPersonCascadePath } from '../personCascadePath';

const ADMIN = 'admin-uid';

const options: ActionPersonCascadeOption[] = [
  {
    value: 'S3_DEPT_HEAD',
    label: '部门负责人',
    children: [
      { value: 'dev-uid', label: 'SSO 开发管理员' },
      { value: ADMIN, label: 'S3管理员' },
    ],
  },
  {
    value: 'S3_PLANT_HEAD',
    label: '厂长',
    children: [
      { value: 'other-uid', label: '测试分厂质量管理员' },
      { value: ADMIN, label: 'S3管理员' },
    ],
  },
  {
    value: 'S3_QE_ENGINEER',
    label: '质量工艺员',
    children: [{ value: ADMIN, label: 'S3管理员' }],
  },
];

describe('personCascadePath', () => {
  it('无 prefer 时 find 落到第一角色（仅作冷启动回显）', () => {
    expect(findPersonCascadePath(options, ADMIN)).toEqual(['S3_DEPT_HEAD', ADMIN]);
  });

  it('prefer 质量工艺员时不串到部门负责人', () => {
    expect(findPersonCascadePath(options, ADMIN, 'S3_QE_ENGINEER')).toEqual([
      'S3_QE_ENGINEER',
      ADMIN,
    ]);
  });

  it('已选路径有效时 cascadePathStillValid 为 true，避免被第一角色覆盖', () => {
    const path = ['S3_QE_ENGINEER', ADMIN];
    expect(cascadePathStillValid(options, path, ADMIN)).toBe(true);
    expect(cascadePathStillValid(options, ['S3_DEPT_HEAD', ADMIN], ADMIN)).toBe(true);
    expect(cascadePathStillValid(options, path, 'other')).toBe(false);
  });
});
