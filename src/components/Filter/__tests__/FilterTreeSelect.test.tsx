import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { Department } from '@/types';
import FilterTreeSelect from '../FilterTreeSelect';

// Mock deptApi
vi.mock('@/api', () => ({
  deptApi: {
    tree: vi.fn().mockResolvedValue({
      data: [
        {
          id: 'dept-1',
          name: '技术部',
          parentId: null,
          sort: 1,
          memberCount: 10,
          children: [
            { id: 'dept-1-1', name: '前端组', parentId: 'dept-1', sort: 1, memberCount: 5 },
          ],
        },
      ],
    }),
  },
}));

const MOCK_TREE: Department[] = [
  {
    id: 'root-1',
    name: '技术部',
    parentId: null,
    sort: 1,
    memberCount: 10,
    children: [
      { id: 'child-1', name: '前端组', parentId: 'root-1', sort: 1, memberCount: 5 },
    ],
  },
  {
    id: 'root-2',
    name: '行政部',
    parentId: null,
    sort: 2,
    memberCount: 3,
  },
];

describe('FilterTreeSelect', () => {
  it('renders with label', () => {
    render(<FilterTreeSelect filterKey="dept" label="部门" treeData={MOCK_TREE} autoLoadDept={false} />);
    expect(screen.getByText('部门')).toBeInTheDocument();
  });

  it('renders with active state', () => {
    render(<FilterTreeSelect filterKey="dept" label="部门" treeData={MOCK_TREE} autoLoadDept={false} active />);
    expect(screen.getByText('部门')).toBeInTheDocument();
  });

  it('shows tree nodes when popover opens', async () => {
    render(<FilterTreeSelect filterKey="dept" label="部门" treeData={MOCK_TREE} autoLoadDept={false} />);
    // 点击触发按钮打开 popover
    fireEvent.click(screen.getByText('部门'));
    // 根节点始终可见
    expect(screen.getByText('技术部')).toBeInTheDocument();
    expect(screen.getByText('行政部')).toBeInTheDocument();
  });

  it('expands tree node on click', async () => {
    render(<FilterTreeSelect filterKey="dept" label="部门" treeData={MOCK_TREE} autoLoadDept={false} />);
    fireEvent.click(screen.getByText('部门'));
    // 子节点默认不可见（第一层未展开）
    expect(screen.queryByText('前端组')).not.toBeInTheDocument();
  });

  it('shows search input when showSearch is true', () => {
    render(
      <FilterTreeSelect filterKey="dept" label="部门" treeData={MOCK_TREE} autoLoadDept={false} showSearch />,
    );
    fireEvent.click(screen.getByText('部门'));
    expect(screen.getByPlaceholderText('搜索部门')).toBeInTheDocument();
  });

  it('does not show search input when showSearch is false', () => {
    render(
      <FilterTreeSelect filterKey="dept" label="部门" treeData={MOCK_TREE} autoLoadDept={false} showSearch={false} />,
    );
    fireEvent.click(screen.getByText('部门'));
    expect(screen.queryByPlaceholderText('搜索部门')).not.toBeInTheDocument();
  });
});
