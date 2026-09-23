import { describe, expect, it } from 'vitest';
import {
  canQueryActionList,
  defaultCreatedRange,
  normalizeActionFilters,
  resetActionFiltersToDefault,
} from '../List/filterDefaults';
import { sanitizeActionHtml } from '../utils/sanitizeActionHtml';

describe('filterDefaults（F1）', () => {
  it('defaultCreatedRange 近 30 天含今天', () => {
    const r = defaultCreatedRange(new Date('2026-09-23T12:00:00'));
    expect(r.from).toBe('2026-08-25');
    expect(r.to).toBe('2026-09-23');
  });

  it('canQueryActionList 无创建窗为 false', () => {
    expect(canQueryActionList({})).toBe(false);
    expect(canQueryActionList({ status: 'approved' })).toBe(false);
    expect(canQueryActionList({ from: '2026-01-01' })).toBe(false);
    expect(canQueryActionList({ from: '2026-01-01', to: '2026-01-31' })).toBe(true);
  });

  it('resetActionFiltersToDefault 可查', () => {
    const next = resetActionFiltersToDefault(new Date('2026-09-23'));
    expect(canQueryActionList(next)).toBe(true);
    expect(normalizeActionFilters({ dimension: '', from: 'a', to: 'b' })).toEqual({
      from: 'a',
      to: 'b',
    });
  });
});

describe('sanitizeActionHtml（F3）', () => {
  it('剥离 script', () => {
    const html = sanitizeActionHtml('<p>ok</p><script>alert(1)</script>');
    expect(html).toContain('<p>ok</p>');
    expect(html.toLowerCase()).not.toContain('script');
  });
});
