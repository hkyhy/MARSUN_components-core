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

/** 区间甘特条：按 seq 累加起点（采集仅 durationMs，非墙钟并行） */
export type WaterfallChartBar = {
  title: string;
  startMs: number;
  endMs: number;
  durationMs: number;
  stepType: string;
};

/** 瀑布/甘特图数据：title + [startMs,endMs]，不含 SQL 原文 */
export function waterfallChartData(steps: AuditStep[]): WaterfallChartBar[] {
  const timed = steps
    .filter((s) => typeof s.durationMs === 'number' && Number.isFinite(s.durationMs))
    .slice()
    .sort((a, b) => a.seq - b.seq);

  let cursor = 0;
  return timed.map((s) => {
    const durationMs = s.durationMs as number;
    const raw = s.title || s.stepType || 'step';
    // 一律带 seq，避免同名只给部分加前缀造成「有的有序号、有的没有」
    const title = `${s.seq}. ${raw}`;
    const startMs = cursor;
    const endMs = cursor + durationMs;
    cursor = endMs;
    return {
      title,
      startMs,
      endMs,
      durationMs,
      stepType: String(s.stepType || ''),
    };
  });
}
