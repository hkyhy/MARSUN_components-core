import { describe, expect, it } from 'vitest';
import {
  filterInboxActionsForHost,
  inboxSceneLabel,
  normalizeInboxActions,
  resolveInboxItemActions,
  resolveInboxSceneKey,
} from '../InboxBell/inboxItemActions';

describe('resolveInboxItemActions', () => {
  it('认领到期 → 去认领', () => {
    const r = resolveInboxItemActions({ category: 'claim_due' });
    expect(r.primary).toEqual({ kind: 'claim_alert', label: '去认领' });
  });

  it('已认领不展示灰按钮，升格为查看任务', () => {
    const r = normalizeInboxActions(
      resolveInboxItemActions({ category: 'claim_due', claimed: true, actionId: 'a1' }),
    );
    expect(r.primary).toEqual({ kind: 'view_task', label: '查看任务' });
    expect(r.secondary).toBeUndefined();
  });

  it('action.assigned 无 actionId → 隐藏去执行', () => {
    const r = normalizeInboxActions(
      resolveInboxItemActions({ category: 'action.assigned', messageType: 'action' }),
    );
    expect(r.primary).toBeUndefined();
  });

  it('action.assigned + actionId → 去执行', () => {
    const r = resolveInboxItemActions({ category: 'action.assigned', actionId: 'x' });
    expect(r.primary?.label).toBe('去执行');
    expect(inboxSceneLabel({ category: 'action.assigned' })).toBe('任务分配');
  });

  it('终态任务隐藏去执行，只留查看任务', () => {
    const r = resolveInboxItemActions({
      category: 'action_assigned',
      actionId: 'x',
      actionStatus: 'done',
    });
    expect(r.primary).toEqual({ kind: 'view_task', label: '查看任务' });
  });

  it('状态变更 / messageType=action → 不落查看预警', () => {
    const byScene = resolveInboxItemActions({
      category: 'action_status_changed',
      actionId: 'a1',
      alertId: 'al1',
    });
    expect(byScene.primary?.kind).toBe('view_task');
    expect(byScene.primary?.label).toBe('查看任务');

    const byType = resolveInboxItemActions({
      messageType: 'action',
      actionId: 'a1',
      alertId: 'al1',
    });
    // 行动类有 actionId 可去执行；绝不能因 alertId 误成「查看预警」
    expect(byType.primary?.kind).not.toBe('view_alert');
    expect(byType.primary?.label).not.toBe('查看预警');
  });

  it('inspect_alert 无 actionId → 仅查看预警，无新建任务', () => {
    const r = resolveInboxItemActions({ category: 'inspect_alert', alertId: '1' });
    expect(r.primary).toEqual({ kind: 'view_alert', label: '查看预警' });
    expect(r.secondary).toBeUndefined();
    const filtered = filterInboxActionsForHost(r, true);
    expect(filtered.secondary).toBeUndefined();
    expect(filtered.primary?.kind).toBe('view_alert');
  });

  it('eventKey=status_changed + 脏 category + alertId → 查看任务/查看，无误查看预警/新建任务', () => {
    const r = filterInboxActionsForHost(
      resolveInboxItemActions({
        category: 'inspect_alert',
        eventKey: 'action.status_changed',
        messageType: 'action',
        alertId: 'al1',
        actionId: 'a1',
        href: '/actions?actionId=a1',
      }),
      true,
    );
    expect(
      resolveInboxSceneKey({
        category: 'inspect_alert',
        eventKey: 'action.status_changed',
      }),
    ).toBe('action_status_changed');
    expect(r.primary?.kind).toBe('view_task');
    expect(r.primary?.label).not.toBe('查看预警');
    expect(r.secondary?.kind).not.toBe('create_task');
    expect(JSON.stringify(r)).not.toContain('create_task');
  });

  it('filter 防御：残留 create_task 一律去掉', () => {
    const filtered = filterInboxActionsForHost(
      {
        primary: { kind: 'view_alert', label: '查看预警' },
        secondary: { kind: 'create_task', label: '新建任务' },
      },
      true,
    );
    expect(filtered.secondary).toBeUndefined();
    expect(filtered.primary?.kind).toBe('view_alert');
  });
});
