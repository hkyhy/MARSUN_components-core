import { describe, expect, it } from 'vitest';
import { createActionPersonWarnMessage, validateCreateActionPersons } from '../submitHelpers';
import type { ActionPersonOption } from '../types';

const allocatorOpts: ActionPersonOption[] = [{ value: 'alloc-1', displayName: '分配人甲' }];
const assigneeOpts: ActionPersonOption[] = [{ value: 'assignee-1', displayName: '执行人乙' }];

describe('validateCreateActionPersons（T1 校验失败）', () => {
  it('缺分配人', () => {
    const r = validateCreateActionPersons('', 'assignee-1', allocatorOpts, assigneeOpts);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe('missing_allocator');
      expect(createActionPersonWarnMessage(r.code)).toBe('请选择分配人');
    }
  });

  it('分配人不在选项中', () => {
    const r = validateCreateActionPersons('ghost', 'assignee-1', allocatorOpts, assigneeOpts);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('invalid_allocator');
  });

  it('缺执行人', () => {
    const r = validateCreateActionPersons('alloc-1', '', allocatorOpts, assigneeOpts);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('missing_assignee');
  });

  it('执行人不在选项中', () => {
    const r = validateCreateActionPersons('alloc-1', 'ghost', allocatorOpts, assigneeOpts);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('invalid_assignee');
  });

  it('校验通过返回选项', () => {
    const r = validateCreateActionPersons('alloc-1', 'assignee-1', allocatorOpts, assigneeOpts);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.allocator.displayName).toBe('分配人甲');
      expect(r.assignee.displayName).toBe('执行人乙');
    }
  });
});
