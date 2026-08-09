/** 绑权三栏目录：页面模块 → 业务功能点分类 → 实际业务功能点 */

export type PermissionBindLeaf = {
  code: string;
  label: string;
  /** 全员基线：勾选且不可取消 */
  defaultGranted?: boolean;
};

export type PermissionBindCategory = {
  key: string;
  label: string;
  leaves: PermissionBindLeaf[];
};

export type PermissionBindModule = {
  key: string;
  label: string;
  /** 未勾 SYSTEM 入口时是否禁用本模块业务勾选 */
  requiresSystemEntry?: boolean;
  categories: PermissionBindCategory[];
};

export type PermissionBindCatalog = {
  systemAppCode: string;
  modules: PermissionBindModule[];
};

export type PermissionBindItem = {
  id: string;
  code: string;
  name: string;
  layer?: string | null;
};
