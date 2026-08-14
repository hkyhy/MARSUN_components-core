import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommonFilter from '../CommonFilter';
import FilterSelect from '../FilterSelect';
import FilterInput from '../FilterInput';

describe('CommonFilter', () => {
  it('renders label and children', () => {
    render(
      <CommonFilter label="筛选条件" layoutMode="desktop">
        <span>Filter1</span>
        <span>Filter2</span>
      </CommonFilter>,
    );
    expect(screen.getByText('筛选条件')).toBeInTheDocument();
    expect(screen.getByText('Filter1')).toBeInTheDocument();
    expect(screen.getByText('Filter2')).toBeInTheDocument();
  });

  it('renders selected items via auto-registration', () => {
    const onStatusChange = vi.fn();
    render(
      <CommonFilter label="已选条件" onClearAll={() => {}}>
        <FilterSelect
          filterKey="status"
          label="状态"
          options={[
            { label: '已通过', value: 'passed' },
            { label: '未通过', value: 'failed' },
          ]}
          value="passed"
          onChange={onStatusChange}
        />
      </CommonFilter>,
    );
    expect(screen.getByText('已通过')).toBeInTheDocument();
    expect(screen.getByText('已通过').closest('.ant-tag')).toHaveTextContent('状态：已通过');
    expect(screen.getByText('清空全部')).toBeInTheDocument();
  });

  it('does not show selected row when no items have value', () => {
    render(
      <CommonFilter label="筛选">
        <FilterSelect
          filterKey="status"
          label="状态"
          options={[{ label: '已通过', value: 'passed' }]}
          value={undefined}
          onChange={() => {}}
        />
      </CommonFilter>,
    );
    expect(screen.queryByText('已选择')).not.toBeInTheDocument();
  });

  it('truncates long selected tag value and keeps full text in tooltip', () => {
    const longValue = '这是一段非常长的筛选值用于测试截断展示效果';
    render(
      <CommonFilter label="筛选" selectedTagMaxLength={10}>
        <FilterInput filterKey="keyword" label="关键词" value={longValue} onChange={() => {}} />
      </CommonFilter>,
    );
    expect(screen.getByText(`${longValue.slice(0, 10)}...`)).toBeInTheDocument();
    expect(screen.queryByText(longValue)).not.toBeInTheDocument();
  });

  it('removes selected item via tag close icon', () => {
    const onKeywordChange = vi.fn();
    render(
      <CommonFilter label="筛选">
        <FilterInput filterKey="keyword" label="关键词" value="测试" onChange={onKeywordChange} />
      </CommonFilter>,
    );
    expect(screen.getByText('测试')).toBeInTheDocument();
    expect(screen.getByText('测试').closest('.ant-tag')).toHaveTextContent('关键词：测试');
    // 点击 tag 关闭图标应调用 onRemove（即 onChange(undefined)）
    const tag = screen.getByText('测试').closest('.ant-tag');
    expect(tag).toBeTruthy();
    const closeIcon = tag!.querySelector('svg');
    expect(closeIcon).toBeTruthy();
    fireEvent.click(closeIcon!);
    expect(onKeywordChange).toHaveBeenCalledWith(undefined);
  });

  it('layoutMode mobile hides label', () => {
    const { container } = render(
      <CommonFilter layoutMode="mobile" label="筛选条件">
        <FilterInput filterKey="q" label="指标" value="x" onChange={() => {}} />
      </CommonFilter>,
    );
    expect(container.querySelector('[data-layout="mobile"]')).toBeTruthy();
    expect(container.querySelector('.common-filter-label')).toBeNull();
  });

  it('displayLine collapses overflow behind 更多', () => {
    render(
      <CommonFilter
        label="筛选"
        layoutMode="desktop"
        displayLine={1}
        list={[
          <FilterSelect
            key="a"
            filterKey="a"
            label="状态A"
            options={[{ label: '1', value: '1' }]}
            value={undefined}
            onChange={() => {}}
          />,
          <FilterSelect
            key="b"
            filterKey="b"
            label="状态B"
            options={[{ label: '2', value: '2' }]}
            value={undefined}
            onChange={() => {}}
          />,
        ]}
      />,
    );
    expect(screen.getByText('状态A')).toBeInTheDocument();
    expect(screen.queryByText('状态B')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /更多/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /更多/ }));
    expect(screen.getByText('状态B')).toBeInTheDocument();
  });

  it('skips list items when hidden=true or display=false', () => {
    render(
      <CommonFilter
        label="筛选"
        list={[
          <FilterSelect
            key="status"
            filterKey="status"
            label="任务状态"
            options={[{ label: '进行中', value: 'running' }]}
            value={undefined}
            onChange={() => {}}
          />,
          <FilterSelect
            key="level"
            filterKey="level"
            label="质量等级"
            options={[{ label: 'A', value: 'A' }]}
            value={undefined}
            onChange={() => {}}
            hidden
          />,
          <FilterInput
            key="keyword"
            filterKey="keyword"
            label="文件名"
            value={undefined}
            onChange={() => {}}
            display={false}
          />,
        ]}
      />,
    );
    expect(screen.getByText('任务状态')).toBeInTheDocument();
    expect(screen.queryByText('质量等级')).not.toBeInTheDocument();
    expect(screen.queryByText('文件名')).not.toBeInTheDocument();
  });
});
