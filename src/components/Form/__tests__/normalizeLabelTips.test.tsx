import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { normalizeLabelTips } from '../normalizeLabelTips';

describe('normalizeLabelTips', () => {
  it('returns undefined for empty / null', () => {
    expect(normalizeLabelTips(null)).toBeUndefined();
    expect(normalizeLabelTips(undefined)).toBeUndefined();
    expect(normalizeLabelTips('')).toBeUndefined();
    expect(normalizeLabelTips('   ')).toBeUndefined();
    expect(normalizeLabelTips(false)).toBeUndefined();
  });

  it('wraps string as Info + TooltipInfo note', () => {
    const node = normalizeLabelTips('生产强烈建议开');
    const { container, getByLabelText } = render(<>{node}</>);
    expect(getByLabelText('说明')).toBeInTheDocument();
    expect(container.querySelector('.tooltip-info-note')).toBeNull();
  });

  it('passes through ReactNode unchanged', () => {
    const custom = <span data-testid="custom-tip">x</span>;
    expect(normalizeLabelTips(custom)).toBe(custom);
  });

  it('passes through function unchanged', () => {
    const fn = () => <span>fn</span>;
    expect(normalizeLabelTips(fn)).toBe(fn);
  });
});
