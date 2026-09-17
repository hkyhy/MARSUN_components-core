import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  countFixtureExamplesMetaMin,
  emitFixtureByEventKey,
  listFixtureCatalog,
  listFixtureEvents,
  listFixtureInbox,
  resetMsgCenterFixture,
} from '../doc/msgCenter.fixture';

const here = dirname(fileURLToPath(import.meta.url));

describe('msgCenter.fixture', () => {
  it('emits bodyHtml rich text and plain summary', () => {
    resetMsgCenterFixture();
    const r = emitFixtureByEventKey('energy.gap', {
      bizDate: '2026-09-16',
      count: '2',
    });
    expect(r.bodyHtml).toContain('<strong>');
    expect(r.bodyHtml).toContain('2026-09-16');
    expect(r.summary).not.toMatch(/</);
    expect(r.summary).toContain('2026-09-16');
    expect(listFixtureInbox()[0].bodyHtml).toContain('<ul>');
  });

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

  it('listFixtureCatalog includes variables SSOT', () => {
    const cat = listFixtureCatalog();
    expect(cat.events.length).toBeGreaterThan(0);
    expect(cat.variables.some((v) => v.key === 'factory')).toBe(true);
    expect(cat.contextSchema.factory.label).toBe('分厂');
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

describe('Editor examples meta gate', () => {
  it('meta.json has at least 4 examples', () => {
    const meta = JSON.parse(
      readFileSync(join(here, '../../../Editor/examples/meta.json'), 'utf8'),
    ) as { examples: unknown[] };
    expect(meta.examples.length).toBeGreaterThanOrEqual(4);
  });
});
