export type AuditStepType =
  'REQUEST' | 'AUTH' | 'SQL' | 'TRANSFORM' | 'UPSTREAM' | 'RESPONSE' | 'ERROR';

export type AuditEventListItem = {
  id: string;
  tenantId: string;
  systemAppId: string;
  traceId: string;
  category?: string;
  actorName?: string | null;
  action: string;
  /** 中文动作名；旧数据可空，展示用 actionLabel || action */
  actionLabel?: string | null;
  summary?: string | null;
  status: string;
  httpMethod?: string | null;
  path?: string | null;
  durationMs?: number | null;
  hasSteps?: boolean;
  createdAt: string;
};

export type AuditStep = {
  id?: string;
  seq: number;
  stepType: AuditStepType | string;
  title: string;
  status: string;
  sqlText?: string | null;
  tables?: string[] | null;
  input?: unknown;
  output?: unknown;
  errorMessage?: string | null;
  errorCode?: string | null;
  meta?: unknown;
  durationMs?: number | null;
  occurredAt?: string | null;
};

export type AuditEventDetail = AuditEventListItem & {
  requestCurl?: string | null;
  steps?: AuditStep[];
};
