import type { ReactNode } from 'react';

export type MessageTemplateAdminItem = {
  id?: string;
  code?: string;
  eventKey?: string;
  scenario?: string;
  label?: string;
  messageType?: string;
  titleTemplate?: string;
  titlePreview?: string;
  bodyTemplate?: string;
  audienceRoles?: string[];
  roles?: string[];
  enabled?: boolean;
  channel?: string;
};

export type MessageEventCatalogItem = {
  eventKey: string;
  label: string;
  messageType?: string;
};

/** catalog API 完整载荷（含变量 SSOT） */
export type MessageEventCatalogPayload = {
  events: MessageEventCatalogItem[];
  /** 原始 schema；优先用 variables */
  contextSchema?: Record<string, string | { type?: string; label?: string }>;
  variables?: MessageTemplateVariable[];
};

export type MessageAudienceRoleOption = {
  /** 写入模板的角色码 */
  code: string;
  /** 展示名（来自 SSO / fixture） */
  name: string;
};

export type MessageTemplateVariable = {
  key: string;
  /** 可选中文说明；无则只显示 {key} */
  label?: string;
  type?: string;
};

export type MessageTemplateAdminProps = {
  fetchTemplates: () => Promise<MessageTemplateAdminItem[]>;
  saveTemplate?: (item: MessageTemplateAdminItem) => Promise<void>;
  /**
   * 事件目录。可返回数组（仅 events）或完整 payload（含 variables / contextSchema）。
   * 变量优先取 payload.variables，否则从 contextSchema 推导；**禁止** FE 平行 DEFAULT_VARS。
   */
  fetchEventCatalog?: () => Promise<MessageEventCatalogItem[] | MessageEventCatalogPayload>;
  /** 列表行切换启用（不经新建表单） */
  setTemplateEnabled?: (item: MessageTemplateAdminItem, enabled: boolean) => Promise<void>;
  /**
   * 受众角色选项（SSO 本系统角色）。未传且无 renderAudienceField 时用空 Select（禁 tags 手输码）。
   */
  fetchAudienceRoles?: () => Promise<MessageAudienceRoleOption[]>;
  /**
   * @deprecated 变量须来自 catalog；仅联调 fixture 可传。业务页勿硬编码平行表。
   */
  templateVariables?: MessageTemplateVariable[];
  /** 预览用示例值；未传则按 variables 生成 */
  previewVars?: Record<string, string>;
  canWrite?: boolean;
  renderAudienceField?: (ctx: {
    roles: string[];
    onChange: (roles: string[]) => void;
  }) => ReactNode;
  pushRulesSlot?: ReactNode;
  emptyText?: string;
  className?: string;
  /** 自动编号前缀，默认 MEQ */
  codePrefix?: string;
};

export function variablesFromCatalog(
  payload: MessageEventCatalogPayload | null | undefined,
): MessageTemplateVariable[] {
  if (!payload) return [];
  if (Array.isArray(payload.variables) && payload.variables.length) {
    return payload.variables
      .map((v) => ({
        key: String(v.key || '').trim(),
        label: v.label,
        type: v.type,
      }))
      .filter((v) => v.key);
  }
  const schema = payload.contextSchema;
  if (!schema || typeof schema !== 'object') return [];
  return Object.entries(schema)
    .map(([key, raw]) => {
      if (typeof raw === 'string') return { key, type: raw };
      if (raw && typeof raw === 'object') {
        return {
          key,
          type: raw.type || 'string',
          label: raw.label,
        };
      }
      return { key };
    })
    .filter((v) => v.key);
}

export function previewVarsFromVariables(vars: MessageTemplateVariable[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const v of vars) {
    out[v.key] = v.type === 'number' ? '1' : v.label || v.key;
  }
  return out;
}
