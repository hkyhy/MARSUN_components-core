import { describe, expect, it } from 'vitest';
import { isActionExecuteHidden } from '../utils/actionExecuteGate';

describe('isActionExecuteHidden', () => {
  it('hides when no execute permission', () => {
    expect(
      isActionExecuteHidden({ status: 'approved' }, { canExecute: false, currentUserId: 'u1' }),
    ).toBe(true);
  });

  it('hides when not approved', () => {
    expect(
      isActionExecuteHidden(
        { status: 'in_progress', assigneeUserId: 'u1' },
        { canExecute: true, currentUserId: 'u1' },
      ),
    ).toBe(true);
  });

  it('shows when approved + empty assignee (claim path)', () => {
    expect(
      isActionExecuteHidden({ status: 'approved' }, { canExecute: true, currentUserId: 'u1' }),
    ).toBe(false);
  });

  it('shows when assignee is self', () => {
    expect(
      isActionExecuteHidden(
        { status: 'approved', assigneeUserId: 'u1' },
        { canExecute: true, currentUserId: 'u1' },
      ),
    ).toBe(false);
  });

  it('hides when assignee is other', () => {
    expect(
      isActionExecuteHidden(
        { status: 'approved', assigneeUserId: 'other' },
        { canExecute: true, currentUserId: 'u1' },
      ),
    ).toBe(true);
  });

  it('hides when assignee set but current user empty', () => {
    expect(
      isActionExecuteHidden(
        { status: 'approved', assigneeUserId: 'other' },
        { canExecute: true, currentUserId: '' },
      ),
    ).toBe(true);
  });
});
