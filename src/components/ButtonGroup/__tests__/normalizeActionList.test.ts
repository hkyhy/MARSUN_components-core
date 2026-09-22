import { describe, expect, it } from 'vitest';
import { actionListItem, normalizeActionList } from '../normalizeActionList';

describe('normalizeActionList', () => {
  it('unavailable → hidden，并去掉 unavailable 字段', () => {
    const next = normalizeActionList([
      { children: '认领', unavailable: true, onClick: () => undefined },
      { children: '分配', unavailable: false, onClick: () => undefined },
    ]);
    expect(next[0]).toMatchObject({ children: '认领', hidden: true });
    expect(next[0]).not.toHaveProperty('unavailable');
    expect(next[1]).toMatchObject({ children: '分配', hidden: false });
  });

  it('hidden 与 unavailable 任一为真 → hidden', () => {
    const next = normalizeActionList([
      { children: 'A', hidden: true, unavailable: false },
      { children: 'B', hidden: false, unavailable: true },
    ]);
    expect(next[0].hidden).toBe(true);
    expect(next[1].hidden).toBe(true);
  });

  it('hideUnavailable=false → 透传', () => {
    const src = [{ children: '认领', unavailable: true, disabled: true }];
    const next = normalizeActionList(src, { hideUnavailable: false });
    expect(next[0]).toEqual(src[0]);
  });

  it('函数项原样保留', () => {
    const fn = () => null;
    const next = normalizeActionList([fn]);
    expect(next[0]).toBe(fn);
  });
});

describe('actionListItem', () => {
  it('can=false 或 available=false → hidden', () => {
    expect(actionListItem({ children: '认领', can: false, onClick: () => undefined }).hidden).toBe(
      true,
    );
    expect(
      actionListItem({ children: '认领', available: false, onClick: () => undefined }).hidden,
    ).toBe(true);
    expect(actionListItem({ children: '认领', onClick: () => undefined }).hidden).toBe(false);
  });
});
