import { describe, expect, it } from 'vitest';
import {
  kneToMarsun,
  kneValueLabel,
  marsunToKne,
  marsunValueLabel,
  mergeKneLabelMaps,
} from '../kneValueAdapter';

describe('kneValueAdapter', () => {
  it('kneToMarsun single / multi', () => {
    expect(kneToMarsun({ label: '启用', value: 'active' }, true)).toBe('active');
    expect(kneToMarsun(null, true)).toBeUndefined();
    expect(
      kneToMarsun(
        [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
        false,
      ),
    ).toEqual(['a', 'b']);
  });

  it('marsunToKne round-trip with labelMap', () => {
    const kne = marsunToKne('active', {
      single: true,
      labelMap: { active: '启用' },
    });
    expect(kne).toEqual({ value: 'active', label: '启用' });
    expect(kneToMarsun(kne, true)).toBe('active');

    const multi = marsunToKne(['a', 'b'], {
      labelMap: { a: '甲', b: '乙' },
    });
    expect(multi).toEqual([
      { value: 'a', label: '甲' },
      { value: 'b', label: '乙' },
    ]);
  });

  it('kneValueLabel / marsunValueLabel', () => {
    expect(kneValueLabel({ label: '启用', value: 'active' }, true)).toBe('启用');
    expect(
      kneValueLabel(
        [
          { label: '甲', value: 'a' },
          { label: '乙', value: 'b' },
        ],
        false,
      ),
    ).toBe('甲、乙');
    expect(marsunValueLabel(['a', 'b'], { a: '甲', b: '乙' })).toBe('甲、乙');
  });

  it('mergeKneLabelMaps', () => {
    const next = mergeKneLabelMaps(
      { label: '启用', value: 'active' },
      { labelMap: {}, itemMap: {} },
    );
    expect(next.labelMap.active).toBe('启用');
    expect(next.itemMap.active.value).toBe('active');
  });
});
