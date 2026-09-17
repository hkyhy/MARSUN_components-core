import { describe, expect, it } from 'vitest';
import { formatDispositionTriggerText } from '../types';

describe('formatDispositionTriggerText', () => {
  it('组装触发文案', () => {
    expect(
      formatDispositionTriggerText({
        kind: 'alarm',
        label: '报警',
        date: '2026-09-10',
        detail: '差距 75%',
      }),
    ).toBe('触发：报警 · 2026-09-10 · 差距 75%');
  });

  it('缺省 date/detail 时只拼有值部分', () => {
    expect(formatDispositionTriggerText({ kind: 'warn', label: '预警' })).toBe('触发：预警');
  });
});
