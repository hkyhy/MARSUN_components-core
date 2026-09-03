import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import FormDataSync from '../FormDataSync';
import { validateRangeAsc } from '../inputRangeRules';

vi.mock('../kneReactForm', () => ({
  useFormApi: vi.fn(),
}));

import { useFormApi } from '../kneReactForm';

const mockedUseFormApi = vi.mocked(useFormApi);

describe('validateRangeAsc', () => {
  it('allows empty and single-sided', () => {
    expect(validateRangeAsc(null).result).toBe(true);
    expect(validateRangeAsc([10, null]).result).toBe(true);
    expect(validateRangeAsc([null, 20]).result).toBe(true);
  });

  it('requires max >= min when both set', () => {
    expect(validateRangeAsc([1, 1]).result).toBe(true);
    expect(validateRangeAsc([10, 20]).result).toBe(true);
    expect(validateRangeAsc([222, 1]).result).toBe(false);
    expect(validateRangeAsc([222, 1]).errMsg).toMatch(/上限不可小于下限/);
  });
});

describe('FormDataSync', () => {
  it('subscribes via fbemitter addListener and removes on unmount', () => {
    const removeSetValue = vi.fn();
    const removeGroup = vi.fn();
    const addListener = vi.fn((event: string) => {
      if (event === 'form:field:set-value') return { remove: removeSetValue };
      return { remove: removeGroup };
    });
    const getFormData = vi.fn(() => ({ maintenanceKind: '大保养' }));
    const onChange = vi.fn();

    mockedUseFormApi.mockReturnValue({
      openApi: { getFormData },
      emitter: { addListener },
    } as never);

    const { unmount } = render(<FormDataSync onChange={onChange} />);

    expect(addListener).toHaveBeenCalledWith('form:field:set-value', expect.any(Function));
    expect(addListener).toHaveBeenCalledWith('form-group:change', expect.any(Function));

    const syncHandler = addListener.mock.calls[0][1] as () => void;
    syncHandler();
    expect(onChange).toHaveBeenCalledWith({ maintenanceKind: '大保养' });

    unmount();
    expect(removeSetValue).toHaveBeenCalled();
    expect(removeGroup).toHaveBeenCalled();
  });

  it('does not bail when emitter has no off/removeListener', () => {
    const addListener = vi.fn(() => ({ remove: vi.fn() }));
    mockedUseFormApi.mockReturnValue({
      openApi: { getFormData: () => ({}) },
      emitter: { addListener },
    } as never);

    render(<FormDataSync onChange={vi.fn()} />);
    expect(addListener).toHaveBeenCalled();
  });
});
