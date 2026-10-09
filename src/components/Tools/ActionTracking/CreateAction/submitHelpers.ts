import type { ActionPersonOption, CreateActionPersonValidateResult } from './types';

const WARN: Record<
  NonNullable<Extract<CreateActionPersonValidateResult, { ok: false }>['code']>,
  string
> = {
  missing_allocator: '请选择分配人',
  invalid_allocator: '分配人无效，请从角色级联中重新选择',
  missing_assignee: '请选择执行人',
  invalid_assignee: '执行人无效，请从角色级联中重新选择',
};

/** 提交前校验分配人/执行人（纯函数，供 Modal 与 vitest） */
export function validateCreateActionPersons(
  allocatorUserId: string,
  assigneeUserId: string,
  allocatorOptions: ActionPersonOption[],
  assigneeOptions: ActionPersonOption[],
): CreateActionPersonValidateResult {
  const allocatorId = String(allocatorUserId || '').trim();
  if (!allocatorId) return { ok: false, code: 'missing_allocator' };
  const allocator = allocatorOptions.find((o) => o.value === allocatorId);
  if (!allocator) return { ok: false, code: 'invalid_allocator' };

  const assigneeId = String(assigneeUserId || '').trim();
  if (!assigneeId) return { ok: false, code: 'missing_assignee' };
  const assignee = assigneeOptions.find((o) => o.value === assigneeId);
  if (!assignee) return { ok: false, code: 'invalid_assignee' };

  return { ok: true, allocator, assignee };
}

export function createActionPersonWarnMessage(
  code: Extract<CreateActionPersonValidateResult, { ok: false }>['code'],
): string {
  return WARN[code];
}

export function personDisplayName(opt: ActionPersonOption | undefined, userId: string): string {
  if (!opt) return userId;
  if (opt.displayName) return opt.displayName;
  if (typeof opt.label === 'string' && opt.label.trim()) return opt.label;
  return userId;
}

export function addDaysYmd(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * FormInfo DatePicker 提交值规范化为 YYYY-MM-DD。
 * kne/antd 可能给出 Dayjs 或已格式化字符串。
 */
export function normalizeDueDateYmd(raw: unknown): string {
  if (raw == null || raw === '') return '';
  if (typeof raw === 'string') {
    const s = raw.trim();
    return s.length >= 10 ? s.slice(0, 10) : s;
  }
  if (typeof raw === 'object') {
    const maybe = raw as { format?: (pattern: string) => string; $d?: Date };
    if (typeof maybe.format === 'function') {
      try {
        return maybe.format('YYYY-MM-DD');
      } catch {
        /* fall through */
      }
    }
    if (maybe.$d instanceof Date && !Number.isNaN(maybe.$d.getTime())) {
      return addDaysYmd(0, maybe.$d);
    }
  }
  return String(raw).trim().slice(0, 10);
}
