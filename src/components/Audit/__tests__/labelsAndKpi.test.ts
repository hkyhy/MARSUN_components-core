import { describe, expect, it } from 'vitest';
import { computeDetailKpi, waterfallChartData } from '../detailKpi';
import { displayActionLabel, displaySummary, labelOfAction } from '../labels';
import type { AuditEventDetail } from '../types';

describe('audit labels', () => {
  it('resolves SSOT label', () => {
    expect(labelOfAction('alertClaim')).toBe('认领告警');
    expect(labelOfAction('unknownX')).toBeNull();
  });

  it('displayActionLabel prefers API then shared then code', () => {
    expect(displayActionLabel('alertClaim', '自定义')).toBe('自定义');
    expect(displayActionLabel('alertClaim', null)).toBe('认领告警');
    expect(displayActionLabel('noSuch', null)).toBe('noSuch');
  });

  it('displaySummary dedupes when same as action label', () => {
    expect(displaySummary('认领告警', '认领告警')).toBe('—');
    expect(displaySummary('', '认领告警')).toBe('—');
    expect(displaySummary('其它说明', '认领告警')).toBe('其它说明');
  });

  it('displaySummary falls back to METHOD path after dedupe', () => {
    expect(
      displaySummary('认领告警', '认领告警', {
        httpMethod: 'POST',
        path: '/api/v1/agents/x/alertClaim',
      }),
    ).toBe('POST /api/v1/agents/x/alertClaim');
    expect(displaySummary(null, '机型列表', { httpMethod: 'POST', path: '/machineTypes' })).toBe(
      'POST /machineTypes',
    );
  });

  it('resolves TRACE SSOT label', () => {
    expect(labelOfAction('machineTypes')).toBe('机型列表');
    expect(labelOfAction('factories')).toBe('分厂列表');
  });
});

describe('detail KPI / waterfall', () => {
  const detail: AuditEventDetail = {
    id: '1',
    tenantId: 't',
    systemAppId: 'equipment-agent',
    traceId: 'tr',
    action: 'alertClaim',
    status: 'success',
    createdAt: '2026-09-18T00:00:00.000Z',
    durationMs: 100,
    steps: [
      { seq: 1, stepType: 'REQUEST', title: '请求进入', status: 'finish', durationMs: 1 },
      {
        seq: 2,
        stepType: 'SQL',
        title: 'query',
        status: 'finish',
        durationMs: 80,
        sqlText: 'SELECT 1',
      },
      { seq: 3, stepType: 'RESPONSE', title: '响应完成', status: 'finish', durationMs: 19 },
    ],
  };

  it('computes KPI', () => {
    const kpi = computeDetailKpi(detail);
    expect(kpi.durationMs).toBe(100);
    expect(kpi.stepCount).toBe(3);
    expect(kpi.sqlCount).toBe(1);
    expect(kpi.slowestStep?.title).toBe('query');
    expect(kpi.hasAnyStepMs).toBe(true);
  });

  it('waterfall omits steps without ms and accumulates range', () => {
    const data = waterfallChartData([
      { seq: 1, stepType: 'SQL', title: 'a', status: 'finish', durationMs: 5 },
      { seq: 2, stepType: 'SQL', title: 'b', status: 'finish' },
      { seq: 3, stepType: 'SQL', title: 'c', status: 'finish', durationMs: 10 },
    ]);
    expect(data).toEqual([
      { title: '1. a', startMs: 0, endMs: 5, durationMs: 5, stepType: 'SQL' },
      { title: '3. c', startMs: 5, endMs: 15, durationMs: 10, stepType: 'SQL' },
    ]);
  });

  it('waterfall sorts by seq and always prefixes title with seq', () => {
    const data = waterfallChartData([
      { seq: 3, stepType: 'SQL', title: 'query', status: 'finish', durationMs: 20 },
      { seq: 1, stepType: 'REQUEST', title: '请求进入', status: 'finish', durationMs: 2 },
      { seq: 2, stepType: 'SQL', title: 'query', status: 'finish', durationMs: 8 },
    ]);
    expect(data).toEqual([
      { title: '1. 请求进入', startMs: 0, endMs: 2, durationMs: 2, stepType: 'REQUEST' },
      { title: '2. query', startMs: 2, endMs: 10, durationMs: 8, stepType: 'SQL' },
      { title: '3. query', startMs: 10, endMs: 30, durationMs: 20, stepType: 'SQL' },
    ]);
  });

  it('empty KPI when no detail', () => {
    const kpi = computeDetailKpi(null);
    expect(kpi.stepCount).toBe(0);
    expect(kpi.hasAnyStepMs).toBe(false);
  });
});
