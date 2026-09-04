/**
 * L2 产品域入口：`@hkyhy/marsun-components-core/iam`
 * IAM 四页（用户/角色/组织/共享组）+ 草稿 EP 工具；须注入 catalog 与 IamClient。
 */
export type { IamClient } from './components/Iam/client';
export type {
  IamOrgUnit,
  IamPermission,
  IamRole,
  IamSharedGroup,
  IamUser,
  IamUsersPageResult,
} from './components/Iam/types';

export {
  buildDraftEffectivePermissions,
  type DraftEpPerm,
} from './components/Iam/utils/draftEffectivePermissions';
export { roleDisplayName, roleSelectOption } from './components/Iam/utils/roleDisplay';
export { MULTI_TAG_SHOW_LENGTH, multiTagSelectProps } from './components/Iam/utils/multiTagSelect';
export { catalogToItems } from './components/Iam/utils/catalogToItems';

export {
  default as IamUsersPage,
  type IamUsersPageProps,
} from './components/Iam/pages/IamUsersPage';
export {
  IamRolesPage,
  IamRolePermissionsPage,
  displayRoleDescription,
  type IamRolesPageProps,
  type IamRolePermissionsPageProps,
} from './components/Iam/pages/IamRolesPage';
export { default as IamOrgPage, type IamOrgPageProps } from './components/Iam/pages/IamOrgPage';
export {
  default as IamSharedGroupsPage,
  type IamSharedGroupsPageProps,
} from './components/Iam/pages/IamSharedGroupsPage';
