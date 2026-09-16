import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  countFixtureExamplesMetaMin,
  emitFixtureByEventKey,
  listFixtureEvents,
  listFixtureInbox,
  resetMsgCenterFixture,
} from '../doc/msgCenter.fixture';

const here = dirname(fileURLToPath(import.meta.url));

describe('msgCenter.fixture', () => {
  it('emits inbox with href from event catalog', () => {
    resetMsgCenterFixture();
    const r = emitFixtureByEventKey('energy.gap', { bizDate: '2026-09-16', count: '2' });
    expect(r.title).toContain('用能缺口');
    expect(r.href).toBe('/energy');
    expect(listFixtureInbox()).toHaveLength(1);
  });

  it('dryRun does not persist', () => {
    resetMsgCenterFixture();
    emitFixtureByEventKey('energy.gap', { bizDate: '2026-09-16', count: '1' }, { dryRun: true });
    expect(listFixtureInbox()).toHaveLength(0);
  });

  it('events cover equipment-agent keys', () => {
    const keys = listFixtureEvents().map((e) => e.eventKey);
    expect(keys).toEqual(expect.arrayContaining(['energy.gap', 'maintenance.overdue']));
  });
});

describe('MessageCenter examples meta gate', () => {
  it('meta.json has at least 6 examples', () => {
    const meta = JSON.parse(readFileSync(join(here, '../examples/meta.json'), 'utf8')) as {
      examples: unknown[];
    };
    expect(meta.examples.length).toBeGreaterThanOrEqual(countFixtureExamplesMetaMin());
  });
});
