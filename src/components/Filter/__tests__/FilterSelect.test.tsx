import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FilterSelect from '../FilterSelect';

describe('FilterSelect', () => {
  afterEach(() => {
    cleanup();
  });

  const options = [
    { label: '选项一', value: 'opt1' },
    { label: '选项二', value: 'opt2' },
    { label: '选项三', value: 'opt3' },
  ];

  it('toggles multiple options and confirms selection', () => {
    const onChange = vi.fn();
    render(
      <FilterSelect
        filterKey="factories"
        label="分厂"
        options={options}
        multiple
        value={[]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText('分厂'));
    fireEvent.click(screen.getByText('选项一'));
    expect(screen.getByText('已选：')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
    expect(onChange).toHaveBeenCalledWith(['opt1']);
  });

  it('toggles option via checkbox click', () => {
    const onChange = vi.fn();
    render(
      <FilterSelect
        filterKey="factories"
        label="分厂"
        options={options}
        multiple
        value={[]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText('分厂'));
    // [0] 为「全选」，选项 checkbox 从 [1] 起
    const checkbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(checkbox);
    expect(screen.getByText('已选：')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
    expect(onChange).toHaveBeenCalledWith(['opt1']);
  });

  it('select-all checks all filtered options then confirms', () => {
    const onChange = vi.fn();
    render(
      <FilterSelect
        filterKey="factories"
        label="分厂"
        options={options}
        multiple
        value={[]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText('分厂'));
    fireEvent.click(screen.getByText('全选'));
    fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
    expect(onChange).toHaveBeenCalledWith(['opt1', 'opt2', 'opt3']);
  });

  it('deselect-all clears selection when minSelection is unset', () => {
    const onChange = vi.fn();
    render(
      <FilterSelect
        filterKey="factories"
        label="分厂"
        options={options}
        multiple
        value={['opt1', 'opt2', 'opt3']}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText('分厂'));
    fireEvent.click(screen.getByText('全选'));
    fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('deselect-all keeps minSelection items', () => {
    const onChange = vi.fn();
    render(
      <FilterSelect
        filterKey="factories"
        label="分厂"
        options={options}
        multiple
        minSelection={1}
        value={['opt1', 'opt2', 'opt3']}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText('分厂'));
    fireEvent.click(screen.getByText('全选'));
    fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
    expect(onChange).toHaveBeenCalledWith(['opt1']);
  });

  it('select-all only applies to search-filtered options', () => {
    const onChange = vi.fn();
    render(
      <FilterSelect
        filterKey="factories"
        label="分厂"
        options={options}
        multiple
        searchable
        value={[]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText('分厂'));
    fireEvent.change(screen.getByPlaceholderText('搜索分厂'), { target: { value: '选项一' } });
    fireEvent.click(screen.getByText('全选'));
    fireEvent.click(screen.getByRole('button', { name: /确\s*定/ }));
    expect(onChange).toHaveBeenCalledWith(['opt1']);
  });

  it('discards draft on cancel without calling onChange', () => {
    const onChange = vi.fn();
    render(
      <FilterSelect
        filterKey="factories"
        label="分厂"
        options={options}
        multiple
        value={['opt1']}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText('分厂'));
    fireEvent.click(screen.getByText('选项二'));
    fireEvent.click(screen.getByRole('button', { name: /取\s*消/ }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not show active state when value equals defaultValues', () => {
    render(
      <FilterSelect
        filterKey="factories"
        label="分厂"
        options={options}
        multiple
        defaultValues={['opt1']}
        value={['opt1']}
      />,
    );

    const trigger = screen
      .getByText('分厂', { selector: '.filter-trigger-root' })
      .closest('.filter-trigger-root');
    expect(trigger?.className).not.toContain('filter-trigger-active');
  });

  it('showDefaultAsSelected keeps active and label 全部 when value equals defaultValues', () => {
    render(
      <FilterSelect
        filterKey="factories"
        label="分厂"
        options={options}
        multiple
        defaultValues={['opt1', 'opt2', 'opt3']}
        value={['opt1', 'opt2', 'opt3']}
        showDefaultAsSelected
      />,
    );

    const trigger = screen
      .getByText('分厂', { selector: '.filter-trigger-root' })
      .closest('.filter-trigger-root');
    expect(trigger?.className).toContain('filter-trigger-active');
  });

  it('keeps draft checkboxes when value equals defaultValues (default all)', () => {
    render(
      <FilterSelect
        filterKey="factories"
        label="分厂"
        options={options}
        multiple
        defaultValues={['opt1', 'opt2', 'opt3']}
        value={['opt1', 'opt2', 'opt3']}
      />,
    );

    fireEvent.click(screen.getByText('分厂'));
    expect(screen.getByText('已选：')).toBeTruthy();
    expect(screen.getAllByText('选项一').length).toBeGreaterThanOrEqual(1);
    const selectAll = screen.getAllByRole('checkbox')[0] as HTMLInputElement;
    expect(selectAll.checked).toBe(true);
  });

  it('shows active state when value differs from defaultValues', () => {
    render(
      <FilterSelect
        filterKey="factories"
        label="分厂"
        options={options}
        multiple
        defaultValues={['opt1']}
        value={['opt1', 'opt2']}
      />,
    );

    const trigger = screen
      .getByText('分厂', { selector: '.filter-trigger-root' })
      .closest('.filter-trigger-root');
    expect(trigger?.className).toContain('filter-trigger-active');
  });
});
