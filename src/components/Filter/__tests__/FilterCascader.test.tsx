import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import FilterCascader, { treeToCascaderOptions } from '../FilterCascader';
import type { TreeFilterNode } from '../FilterTreeSelect';
import CommonFilter from '../CommonFilter';

afterEach(() => {
  cleanup();
});

const MOCK_TREE: TreeFilterNode[] = [
  {
    id: '1001',
    name: '一分厂',
    children: [
      { id: '1001@@JCF14.6KD@@', name: 'JCF14.6KD' },
      { id: '1001@@JC40S@@', name: 'JC40S' },
    ],
  },
  {
    id: '1050',
    name: '五分厂',
    children: [{ id: '1050@@JCF14.8KD@@', name: 'JCF14.8KD' }],
  },
];

function openFilter(label: string) {
  const triggers = screen.getAllByText(label);
  fireEvent.click(triggers[0]);
}

describe('treeToCascaderOptions', () => {
  it('maps tree id/name to cascader value/label', () => {
    const opts = treeToCascaderOptions(MOCK_TREE);
    expect(opts).toHaveLength(2);
    expect(opts[0].value).toBe('1001');
    expect(opts[0].label).toBe('一分厂');
    expect(opts[0].children?.[0].value).toBe('1001@@JCF14.6KD@@');
  });
});

describe('FilterCascader', () => {
  it('renders with label', () => {
    render(<FilterCascader filterKey="primary-a" label="主对标A" treeData={MOCK_TREE} leafOnly />);
    expect(screen.getByText('主对标A')).toBeInTheDocument();
  });

  it('shows factory column when popover opens', () => {
    render(<FilterCascader filterKey="primary-b" label="主对标B" treeData={MOCK_TREE} leafOnly />);
    openFilter('主对标B');
    expect(screen.getByText('一分厂')).toBeInTheDocument();
    expect(screen.getByText('五分厂')).toBeInTheDocument();
  });

  it('single select emits leaf id only via onChange', () => {
    const onChange = vi.fn();
    const onChangePath = vi.fn();
    render(
      <FilterCascader
        filterKey="primary-c"
        label="主对标C"
        treeData={MOCK_TREE}
        leafOnly
        onChange={onChange}
        onChangePath={onChangePath}
      />,
    );
    openFilter('主对标C');
    fireEvent.click(screen.getByText('一分厂'));
    fireEvent.click(screen.getByText('JCF14.6KD'));
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last).toBe('1001@@JCF14.6KD@@');
    const path = onChangePath.mock.calls.at(-1)?.[0];
    expect(path).toEqual(['1001', '1001@@JCF14.6KD@@']);
  });

  it('multiple select emits leaf id list', () => {
    const onChange = vi.fn();
    render(
      <CommonFilter label="筛选">
        <FilterCascader
          filterKey="compare-d"
          label="对比D"
          treeData={MOCK_TREE}
          leafOnly
          multiple
          onChange={onChange}
        />
      </CommonFilter>,
    );
    openFilter('对比D');
    fireEvent.click(screen.getByText('一分厂'));
    fireEvent.click(screen.getByText('JCF14.6KD'));
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)?.[0];
    expect(Array.isArray(last)).toBe(true);
    expect(last).toContain('1001@@JCF14.6KD@@');
    expect(last).not.toContain('1001');
  });

  it('multiple leafOnly does not emit factory parent id as value', () => {
    const onChange = vi.fn();
    render(
      <FilterCascader
        filterKey="compare-parent"
        label="对比P"
        treeData={MOCK_TREE}
        leafOnly
        multiple
        onChange={onChange}
      />,
    );
    openFilter('对比P');
    // 勾选父级时（若组件允许）应展开为叶子，而非工厂 Code
    const factoryRow = screen.getByText('一分厂');
    fireEvent.click(factoryRow);
    // 点父级展开后勾选两个叶子
    fireEvent.click(screen.getByText('JCF14.6KD'));
    fireEvent.click(screen.getByText('JC40S'));
    const last = onChange.mock.calls.at(-1)?.[0] as string[] | undefined;
    expect(last?.every((id) => id.includes('@@'))).toBe(true);
    expect(last?.some((id) => id === '1001')).toBeFalsy();
  });

  it('shows search when showSearch is true', () => {
    render(
      <FilterCascader
        filterKey="primary-e"
        label="主对标E"
        treeData={MOCK_TREE}
        leafOnly
        showSearch
      />,
    );
    openFilter('主对标E');
    expect(screen.getByPlaceholderText('搜索主对标E')).toBeInTheDocument();
  });
});
