/** 详情处置展开时的触发上下文（仅展示；写仍机台 grain） */

/**
 * 等级粗粒度键。常用 info|warn|alarm|critical|overdue；
 * 项目可自定任意 string（与契约 alertLevel / 配置中心 key 对齐）。
 */
export type DispositionAlertKind = string;

export type DispositionAlertContext = {
  /** 等级键（常等于 catalog.key） */
  kind: DispositionAlertKind;
  /** 展示文案：取 catalog.label / 接口已有字段，禁 FE 平行码表 */
  label: string;
  date?: string;
  detail?: string;
  /**
   * 可选色标（展示用）：来自 catalog.tone / 业务配置。
   * 不同等级 → 不同颜色；与圆点/方点等形状解耦。
   */
  tone?: string;
};

/**
 * 项目注入的「预警等级展示」规格。
 * SSOT 在业务配置/契约；core 不写死任何产品的级数/文案/阈值。
 */
export type DispositionAlertLevelSpec = {
  /** 等级键（与契约 alertLevel / 业务码对齐） */
  key: string;
  /** 展示名 */
  label: string;
  /** 色标 hex / antd 色名 */
  tone: string;
  /** 写入 context.kind；缺省 = key */
  kind?: DispositionAlertKind;
  /** 图点大小（可选；仅可视化） */
  pointSize?: number;
  /** 图点形状（可选；默认 point；形状≠等级语义） */
  shape?: string;
};

/** 等级目录：由项目/租户配置注入 */
export type DispositionAlertLevelCatalog = readonly DispositionAlertLevelSpec[];

/** 组装「触发：」条可见文案 */
export function formatDispositionTriggerText(ctx: DispositionAlertContext): string {
  const parts = [ctx.label.trim(), ctx.date?.trim(), ctx.detail?.trim()].filter(Boolean);
  return `触发：${parts.join(' · ')}`;
}

/** 按 key 查等级规格（大小写不敏感） */
export function getDispositionAlertLevel(
  catalog: DispositionAlertLevelCatalog,
  key: string | null | undefined,
): DispositionAlertLevelSpec | undefined {
  const raw = (key || '').trim();
  if (!raw) return undefined;
  const lower = raw.toLowerCase();
  return catalog.find((s) => s.key === raw) || catalog.find((s) => s.key.toLowerCase() === lower);
}

/**
 * 从 catalog 组装触发上下文。
 * key 不在目录内 → null（调用方勿用硬编码中文兜底冒充等级）。
 */
export function buildDispositionAlertContext(
  catalog: DispositionAlertLevelCatalog,
  key: string,
  extras?: { date?: string; detail?: string },
): DispositionAlertContext | null {
  const spec = getDispositionAlertLevel(catalog, key);
  if (!spec) return null;
  return {
    kind: spec.kind ?? spec.key,
    label: spec.label,
    tone: spec.tone,
    date: extras?.date,
    detail: extras?.detail,
  };
}
