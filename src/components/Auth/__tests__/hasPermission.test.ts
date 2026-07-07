import { describe, expect, it } from 'vitest';
import { hasPermission } from '../hasPermission';

describe('hasPermission', () => {
  it('returns false when check is undefined', () => {
    expect(hasPermission(undefined, 'file:view')).toBe(false);
  });

  it('delegates to injected check callback', () => {
    const check = (perm: string) => perm === 'file:view';
    expect(hasPermission(check, 'file:view')).toBe(true);
    expect(hasPermission(check, 'file:delete')).toBe(false);
  });
});
