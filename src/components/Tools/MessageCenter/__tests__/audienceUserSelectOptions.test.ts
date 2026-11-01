import { describe, expect, it } from 'vitest';
import {
  buildAudienceUserSelectOptions,
  mergeAudienceUsers,
} from '../utils/audienceUserSelectOptions';

describe('buildAudienceUserSelectOptions', () => {
  it('keeps input order and puts department in description', () => {
    const opts = buildAudienceUserSelectOptions([
      {
        id: 'u2',
        name: '李四',
        departmentName: '质量部',
        roleNames: '审核员',
        employeeId: 'E002',
      },
      {
        id: 'u1',
        name: '张三',
        departmentName: '质量部',
        roleNames: '质检员、班组长',
        employeeId: 'E001',
      },
      { id: 'u3', name: '王五', roleNames: '系统管理员' },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['u2', 'u1', 'u3']);
    expect(opts[0].description).toBe('质量部 · 审核员 · 工号 E002');
    expect(opts[1].description).toBe('质量部 · 质检员、班组长 · 工号 E001');
    expect(opts[2].description).toBe('系统管理员');
    expect(opts[0].searchText).toContain('质量部');
  });
});

describe('mergeAudienceUsers', () => {
  it('dedupes by id, keeps base order, appends new ids', () => {
    const merged = mergeAudienceUsers(
      [{ id: 'a', name: '甲' }],
      [
        { id: 'a', name: '甲-新' },
        { id: 'b', name: '乙' },
      ],
    );
    expect(merged).toEqual([
      { id: 'a', name: '甲' },
      { id: 'b', name: '乙' },
    ]);
  });
});
