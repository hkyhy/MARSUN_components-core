import type { AuditEventDetail, AuditStep } from './types';

export type AuditDetailKpi = {
  durationMs: number | null;
  stepCount: number;
  sqlCount: number;
  slowestStep: { title: string; durationMs: number } | null;
  hasAnyStepMs: boolean;
};

export function computeDetailKpi(detail: AuditEventDetail | null | undefined): AuditDetailKpi {
  const steps = detail?.steps || [];
  let sqlCount = 0;
  let slowest: { title: string; durationMs: number } | null = null;
  let hasAnyStepMs = false;
  for (const s of steps) {
    if (s.stepType === 'SQL') sqlCount += 1;
    if (typeof s.durationMs === 'number' && Number.isFinite(s.durationMs)) {
      hasAnyStepMs = true;
      if (!slowest || s.durationMs > slowest.durationMs) {
        slowest = { title: s.title || s.stepType, durationMs: s.durationMs };
      }
    }
  }
  return {
    durationMs: typeof detail?.durationMs === 'number' ? detail.durationMs : null,
    stepCount: steps.length,
    sqlCount,
    slowestStep: slowest,
    hasAnyStepMs,
  };
}

export function isErrorStep(s: AuditStep): boolean {
  return s.stepType === 'ERROR' || s.status === 'error' || s.status === 'fail';
}

/** 瀑布图数据：仅 title + durationMs，不含 SQL 原文 */
export function waterfallChartData(
  steps: AuditStep[],
): Array<{ title: string; durationMs: number }> {
  return steps
    .filter((s) => typeof s.durationMs === 'number' && Number.isFinite(s.durationMs))
    .map((s) => ({
      title: s.title || s.stepType || 'step',
      durationMs: s.durationMs as number,
    }));
}
