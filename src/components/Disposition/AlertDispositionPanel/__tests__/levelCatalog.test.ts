import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DispositionAlertLevelLegend from '../LevelLegend';
import {
  buildDispositionAlertContext,
  getDispositionAlertLevel,
  type DispositionAlertLevelCatalog,
} from '../types';

const SAMPLE: DispositionAlertLevelCatalog = [
  { key: 'L1', label: '一级提示', tone: '#1677ff', kind: 'info', pointSize: 6 },
  { key: 'warn', label: '预警', tone: '#faad14', pointSize: 5 },
  { key: 'alarm', label: '报警', tone: '#ef4444', pointSize: 6 },
];

describe('DispositionAlertLevelCatalog', () => {
  it('getDispositionAlertLevel 按 key 查', () => {
    expect(getDispositionAlertLevel(SAMPLE, 'warn')?.label).toBe('预警');
    expect(getDispositionAlertLevel(SAMPLE, 'WARN')?.tone).toBe('#faad14');
    expect(getDispositionAlertLevel(SAMPLE, 'missing')).toBeUndefined();
  });

  it('buildDispositionAlertContext 组装；未知 key → null', () => {
    expect(
      buildDispositionAlertContext(SAMPLE, 'L1', { date: '2026-09-10', detail: '偏高' }),
    ).toEqual({
      kind: 'info',
      label: '一级提示',
      tone: '#1677ff',
      date: '2026-09-10',
      detail: '偏高',
    });
    expect(buildDispositionAlertContext(SAMPLE, 'nope')).toBeNull();
  });

  it('LevelLegend 按 catalog 渲染', () => {
    const html = renderToStaticMarkup(
      createElement(DispositionAlertLevelLegend, { catalog: SAMPLE, title: '等级' }),
    );
    expect(html).toContain('一级提示');
    expect(html).toContain('预警');
    expect(html).toContain('报警');
  });
});
