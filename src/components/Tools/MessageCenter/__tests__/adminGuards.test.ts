import { describe, expect, it } from 'vitest';
import { canDeleteTenantVariable, resolveTemplateCodeAfterEventChange } from '../utils/adminGuards';

describe('adminGuards', () => {
  it('resolveTemplateCodeAfterEventChange clears dirty code', () => {
    const opts = [{ value: 'MEQ-A' }, { value: 'MEQ-B' }];
    expect(resolveTemplateCodeAfterEventChange('MEQ-A', opts)).toBe('MEQ-A');
    expect(resolveTemplateCodeAfterEventChange('MEQ-OTHER', opts)).toBe('');
    expect(resolveTemplateCodeAfterEventChange(undefined, opts)).toBe('');
    expect(resolveTemplateCodeAfterEventChange('MEQ-A', [])).toBe('');
  });

  it('canDeleteTenantVariable blocks catalog baseline', () => {
    expect(canDeleteTenantVariable({ source: 'catalog' })).toBe(false);
    expect(canDeleteTenantVariable({ source: 'tenant', baseline: true })).toBe(false);
    expect(canDeleteTenantVariable({ source: 'tenant', baseline: false })).toBe(true);
    expect(canDeleteTenantVariable({ source: 'tenant' })).toBe(true);
  });
});
