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

  it('waterfall omits steps without ms', () => {
    const data = waterfallChartData([
      { seq: 1, stepType: 'SQL', title: 'a', status: 'finish', durationMs: 5 },
      { seq: 2, stepType: 'SQL', title: 'b', status: 'finish' },
    ]);
    expect(data).toEqual([{ title: 'a', durationMs: 5 }]);
  });

  it('empty KPI when no detail', () => {
    const kpi = computeDetailKpi(null);
    expect(kpi.stepCount).toBe(0);
    expect(kpi.hasAnyStepMs).toBe(false);
  });
});
