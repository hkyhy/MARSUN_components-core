import { describe, expect, it } from 'vitest';
import { buildAudienceUserSelectGroups } from '../utils/audienceUserSelectOptions';

describe('buildAudienceUserSelectGroups', () => {
  it('groups by departmentName and builds role·employee description', () => {
    const groups = buildAudienceUserSelectGroups([
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
    expect(groups.map((g) => g.label)).toEqual(['质量部', '未分配部门']);
    expect(groups[0].options.map((o) => o.label)).toEqual(['李四', '张三']);
    expect(groups[0].options[1].description).toBe('质检员、班组长 · 工号 E001');
    expect(groups[1].options[0].description).toBe('系统管理员');
    expect(groups[0].options[1].searchText).toContain('质量部');
  });
});
