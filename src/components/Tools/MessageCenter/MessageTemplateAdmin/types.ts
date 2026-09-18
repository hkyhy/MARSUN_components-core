import type { ReactNode } from 'react';

export type MessageCrudFlags = {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
};

export type MessageAdminPermissions = {
  template?: Partial<MessageCrudFlags>;
  push?: Partial<MessageCrudFlags>;
  variable?: Partial<MessageCrudFlags>;
};

const ALL_CRUD_OFF: MessageCrudFlags = {
  create: false,
  read: false,
  update: false,
  delete: false,
};

const ALL_CRUD_ON: MessageCrudFlags = {
  create: true,
  read: true,
  update: true,
  delete: true,
};

function mergeCrud(
  partial: Partial<MessageCrudFlags> | undefined,
  fallback: MessageCrudFlags,
): MessageCrudFlags {
  return {
    create: partial?.create ?? fallback.create,
    read: partial?.read ?? fallback.read,
    update: partial?.update ?? fallback.update,
    delete: partial?.delete ?? fallback.delete,
  };
}

/** 解析 Admin 门禁：有 permissions 用细粒度；否则 canWrite 作 Showcase 全开/全关。 */
export function resolveMessageAdminPermissions(
  permissions: MessageAdminPermissions | undefined,
  canWrite: boolean | undefined,
): { template: MessageCrudFlags; push: MessageCrudFlags; variable: MessageCrudFlags } {
  const fallback = canWrite ? ALL_CRUD_ON : ALL_CRUD_OFF;
  if (!permissions) {
    return { template: fallback, push: fallback, variable: fallback };
  }
  return {
    template: mergeCrud(permissions.template, ALL_CRUD_OFF),
    push: mergeCrud(permissions.push, ALL_CRUD_OFF),
    variable: mergeCrud(permissions.variable, ALL_CRUD_OFF),
  };
}

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

/** 推送规则例外抄送选项（SSO 本租户用户；展示名取自接口） */
export type MessageAudienceUserOption = {
  id: string;
  /** displayName 优先 */
  name: string;
  /** 工号（SSO employeeId） */
  employeeId?: string;
  /** 主部门 / 首个组织名（SSO orgs） */
  departmentName?: string;
  /** 角色展示名，顿号拼接（SSO roles.name） */
  roleNames?: string;
};

export type MessageTemplateVariable = {
  key: string;
  /** 可选中文说明；无则下拉只显示 code */
  label?: string;
  type?: string;
  source?: 'catalog' | 'tenant';
  baseline?: boolean;
};

/** 变量管理行 */
export type MessageTemplateVariableAdmin = MessageTemplateVariable;

export type PushRuleAdminItem = {
  id?: string;
  code?: string;
  label?: string;
  eventKey?: string;
  levels?: string[];
  templateCode?: string;
  audienceRoles?: string[];
  audienceUserIds?: string[];
  channels?: string[];
  slaHours?: number;
  scanLookbackDays?: number;
  enabled?: boolean;
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
   * 推送规则「例外抄送」多选 options（SSO 本租户用户；静态 userIds）。
   * 未传则例外抄送 Select 为空（禁手输 id）；展示名须来自接口 displayName。
   * 任务认领人/分配人等当事人由业务 emit 传 userIds，勿靠配置面点名。
   */
  fetchAudienceUsers?: () => Promise<MessageAudienceUserOption[]>;
  /**
   * @deprecated 变量须来自 catalog；仅联调 fixture 可传。业务页勿硬编码平行表。
   */
  templateVariables?: MessageTemplateVariable[];
  /** 预览用示例值；未传则按 variables 生成 */
  previewVars?: Record<string, string>;
  /**
   * Showcase 快捷：true→十二项全开，false→全关。
   * 业务仓须传 permissions，禁止只靠 canWrite 当真门禁。
   */
  canWrite?: boolean;
  /**
   * 细粒度 CRUD 门禁（模板 / 推送 / 变量 × create|read|update|delete）。
   * 传入后优先于 canWrite。
   */
  permissions?: MessageAdminPermissions;
  /** 模板受众角色插槽；须保持多选下拉语义，禁止 Tree 盖壳默认 Select */
  renderAudienceField?: (ctx: {
    roles: string[];
    onChange: (roles: string[]) => void;
  }) => ReactNode;
  /** @deprecated 优先传 fetchPushRules */
  pushRulesSlot?: ReactNode;
  fetchPushRules?: () => Promise<PushRuleAdminItem[]>;
  savePushRule?: (item: PushRuleAdminItem) => Promise<void>;
  setPushRuleEnabled?: (item: PushRuleAdminItem, enabled: boolean) => Promise<void>;
  deletePushRule?: (item: PushRuleAdminItem) => Promise<void>;
  fetchVariables?: () => Promise<MessageTemplateVariableAdmin[]>;
  saveVariable?: (item: MessageTemplateVariableAdmin) => Promise<void>;
  deleteVariable?: (item: MessageTemplateVariableAdmin) => Promise<void>;
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
        source: v.source,
        baseline: v.baseline,
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
