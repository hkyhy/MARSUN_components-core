import { describe, expect, it } from 'vitest';
import { templateSourceTag } from '../MessageTemplateAdmin/List/columns';

describe('templateSourceTag', () => {
  it('marks catalog source as 内置', () => {
    expect(templateSourceTag({ id: 'tpl-1', source: 'catalog' }).label).toBe('内置');
  });

  it('marks builtin- id as 内置 when source omitted', () => {
    expect(templateSourceTag({ id: 'builtin-alert-created' }).label).toBe('内置');
  });

  it('marks tenant source as 自定义', () => {
    expect(templateSourceTag({ id: 'tpl-2', source: 'tenant' }).label).toBe('自定义');
  });

  it('defaults unknown rows to 自定义', () => {
    expect(templateSourceTag({ id: 'tpl-3' }).label).toBe('自定义');
  });
});
