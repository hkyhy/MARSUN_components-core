import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SUPER_SELECT_ALL_VALUE, isSuperSelectAllValue } from '../SuperSelect';

const here = dirname(fileURLToPath(import.meta.url));

describe('isSuperSelectAllValue', () => {
  it('detects default sentinel in array and scalar', () => {
    expect(isSuperSelectAllValue([SUPER_SELECT_ALL_VALUE])).toBe(true);
    expect(isSuperSelectAllValue(SUPER_SELECT_ALL_VALUE)).toBe(true);
    expect(isSuperSelectAllValue(['F01'])).toBe(false);
    expect(isSuperSelectAllValue(['all', 'F01'])).toBe(false);
    expect(isSuperSelectAllValue([])).toBe(false);
    expect(isSuperSelectAllValue(undefined)).toBe(false);
  });

  it('supports custom sentinel', () => {
    expect(isSuperSelectAllValue(['*'], '*')).toBe(true);
    expect(isSuperSelectAllValue(['all'], '*')).toBe(false);
  });
});

describe('SuperSelect focus stability', () => {
  it('render(stable SuperSelectField) without inline Bound', () => {
    const src = readFileSync(join(here, '../SuperSelect.tsx'), 'utf8');
    expect(src).toMatch(/return render\(SuperSelectField\)/);
    expect(src).not.toMatch(/const Bound\s*=/);
  });
});
