import { describe, expect, it } from 'vitest';
import { formatDispositionStatusBadge } from '../formatDispositionStatusBadge';

describe('formatDispositionStatusBadge', () => {
  it('keeps short badge without dumping long note', () => {
    const note = 'x'.repeat(200);
    const r = formatDispositionStatusBadge({
      statusLabel: '已闭环',
      typeLabel: '误报',
      updatedAt: '2026-10-12 09:07:32',
      note,
    });
    expect(r.short).toBe('已闭环 · 误报');
    expect(r.short.length).toBeLessThan(40);
    expect(r.detail).toContain('2026-10-12 09:07:32');
    expect(r.detail).toContain(note);
  });

  it('omits type when same as status', () => {
    expect(formatDispositionStatusBadge({ statusLabel: '已关闭', typeLabel: '已关闭' }).short).toBe(
      '已关闭',
    );
  });

  it('status only when no type/detail', () => {
    expect(formatDispositionStatusBadge({ statusLabel: '已认领' })).toEqual({
      short: '已认领',
      detail: undefined,
    });
  });
});
