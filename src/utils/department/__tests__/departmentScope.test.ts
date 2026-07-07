import { describe, expect, it } from 'vitest';
import type { DepartmentTreeNode } from '../types';
import {
  collectDepartmentIds,
  extractDepartmentSubtree,
  findDepartmentRootId,
  flattenDepartments,
  getNormalUserAccessibleDepartmentIds,
  getNormalUserDepartmentTree,
} from '../departmentScope';

const sampleTree: DepartmentTreeNode[] = [
  {
    id: 'admin',
    name: '行政部',
    parentId: null,
    children: [],
  },
  {
    id: 'tech',
    name: '技术部',
    parentId: null,
    children: [
      {
        id: 'digital',
        name: '数字化',
        parentId: 'tech',
        children: [],
      },
      {
        id: 'info',
        name: '信息部',
        parentId: 'tech',
        children: [],
      },
    ],
  },
];

describe('departmentScope', () => {
  const flat = flattenDepartments(sampleTree);

  it('finds root department for nested user department', () => {
    expect(findDepartmentRootId('info', flat)).toBe('tech');
    expect(findDepartmentRootId('admin', flat)).toBe('admin');
  });

  it('collects department subtree ids', () => {
    expect(collectDepartmentIds('tech', flat).sort()).toEqual(['digital', 'info', 'tech'].sort());
  });

  it('returns accessible ids for normal user in info department', () => {
    expect(getNormalUserAccessibleDepartmentIds('info', flat).sort()).toEqual(
      ['digital', 'info', 'tech'].sort(),
    );
  });

  it('extracts organization branch tree for normal user', () => {
    const scoped = getNormalUserDepartmentTree('info', sampleTree);
    expect(scoped).toHaveLength(1);
    expect(scoped[0]?.id).toBe('tech');
    expect(scoped[0]?.children?.map((d) => d.id).sort()).toEqual(['digital', 'info'].sort());
  });

  it('extractDepartmentSubtree returns single root node', () => {
    const subtree = extractDepartmentSubtree('tech', sampleTree);
    expect(subtree[0]?.name).toBe('技术部');
    expect(subtree[0]?.children).toHaveLength(2);
  });
});
