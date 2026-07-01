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
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);
    expect(screen.getByText('已选：')).toBeTruthy();
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

    const trigger = screen.getByText('分厂', { selector: '.filter-trigger-root' }).closest('.filter-trigger-root');
    expect(trigger?.className).not.toContain('filter-trigger-active');
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

    const trigger = screen.getByText('分厂', { selector: '.filter-trigger-root' }).closest('.filter-trigger-root');
    expect(trigger?.className).toContain('filter-trigger-active');
  });
});
