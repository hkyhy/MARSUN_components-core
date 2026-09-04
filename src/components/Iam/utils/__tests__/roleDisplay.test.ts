import { describe, expect, it } from 'vitest';
import { roleDisplayName, roleSelectOption } from '../roleDisplay';

describe('roleDisplay', () => {
  it('prefers name over code', () => {
    expect(roleDisplayName({ name: '管理员', code: 'ADMIN' })).toBe('管理员');
    expect(roleDisplayName({ name: '', code: 'ADMIN' })).toBe('ADMIN');
  });

  it('builds select option', () => {
    expect(roleSelectOption({ name: '管理员', code: 'ADMIN' })).toEqual({
      value: 'ADMIN',
      label: '管理员',
      title: '编码：ADMIN',
    });
  });
});
