import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useFilterState } from '../useFilterState';

describe('useFilterState', () => {
  it('registers and unregisters filter items', () => {
    const { result } = renderHook(() => useFilterState());

    // 初始为空
    expect(result.current.selectedItems).toHaveLength(0);

    // 注册一个有值的筛选项
    act(() => {
      result.current.register('status', {
        label: '状态',
        valueLabel: '已通过',
        onRemove: () => {},
      });
    });
    expect(result.current.selectedItems).toHaveLength(1);
    expect(result.current.selectedItems[0]).toEqual(
      expect.objectContaining({ key: 'status', label: '状态', valueLabel: '已通过' }),
    );

    // 注销
    act(() => {
      result.current.unregister('status');
    });
    expect(result.current.selectedItems).toHaveLength(0);
  });

  it('filters out items with empty valueLabel', () => {
    const { result } = renderHook(() => useFilterState());

    act(() => {
      result.current.register('status', {
        label: '状态',
        valueLabel: '',
        onRemove: () => {},
      });
    });
    // 空 valueLabel 不应出现在 selectedItems 中
    expect(result.current.selectedItems).toHaveLength(0);

    // 更新 valueLabel
    act(() => {
      result.current.register('status', {
        label: '状态',
        valueLabel: '已通过',
        onRemove: () => {},
      });
    });
    expect(result.current.selectedItems).toHaveLength(1);
  });

  it('clearAll calls onRemove for each registration', () => {
    const onRemoveA = vi.fn();
    const onRemoveB = vi.fn();
    const { result } = renderHook(() => useFilterState());

    act(() => {
      result.current.register('a', { label: 'A', valueLabel: '1', onRemove: onRemoveA });
      result.current.register('b', { label: 'B', valueLabel: '2', onRemove: onRemoveB });
    });

    act(() => {
      result.current.clearAll();
    });

    expect(onRemoveA).toHaveBeenCalledTimes(1);
    expect(onRemoveB).toHaveBeenCalledTimes(1);
    expect(result.current.selectedItems).toHaveLength(0);
  });
});
