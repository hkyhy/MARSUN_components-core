// Provider & theme
export { MarsunCoreProvider, useMarsunAuth, useMarsunCore, useMarsunFetch } from './provider';
export type { MarsunCoreProviderProps, MarsunAuthContext, MarsunFetchContext } from './provider';

export {
  generateTheme,
  applyThemeToCssVariables,
  applyCssTokenOverrides,
  DEFAULT_PRIMARY_COLOR,
  PALETTE,
  LAYOUT_TOKENS,
} from './theme';

// Hooks & utils
export { useFetchData, fetchWithTimeout } from './hooks/useFetchData';
export type { FetchDataOptions, FetchDataResult } from './hooks/useFetchData';
export {
  resolveMaybeFn,
  resolveVisible,
  type MaybeFn,
  type Visibility,
} from './utils/resolveMaybeFn';
export { formatFileSize } from './utils/format';
export {
  toDateRange,
  toDateTimeRange,
  toApiStartEnd,
  recentDayRange,
  recentYearRange,
  recentDayRangeStrings,
} from './utils/date';
export {
  formatPickerValue,
  parsePickerValue,
  isValidPickerValue,
  type DatePickerGranularity,
} from './utils/pickerDate';
export {
  REDIRECT_URL_PARAM,
  resolveRedirectUrl,
  buildLocationRedirectUrl,
  buildAbsoluteLocationRedirectUrl,
  buildLoginPath,
  readRedirectUrlFromSearch,
} from './utils/authRedirect';
export type { BuildLoginPathOptions } from './utils/authRedirect';
export {
  DEFAULT_LAST_ACTIVITY_STORAGE_KEY,
  getLastActivityTime,
  touchLastActivity,
  clearLastActivity,
} from './utils/sessionActivity';
export {
  USER_ROLE_PERMISSIONS_KEY,
  PERMISSION_DEFINITIONS_KEY,
  PERMISSIONS_STORAGE_KEY,
  loadUserRolePermissions,
  saveUserRolePermissions,
  loadPermissionDefinitions,
  savePermissionDefinitions,
  getStoredUserPermissions,
  getStoredPermissionMap,
} from './utils/permissionStorage';
export { createMarsunRequest } from './utils/createMarsunRequest';
export type {
  MarsunApiResponse,
  CreateMarsunRequestOptions,
  MarsunRequestClient,
} from './utils/createMarsunRequest';
export type {
  UserRolePermissions,
  PermissionDefinition,
  PermissionDefinitionsResponse,
} from './types/auth';
export {
  buildDepartmentPathMapFromTree,
  buildDepartmentPathMapFromFlat,
  getDepartmentPath,
  buildLeafDepartmentPathMap,
  buildDepartmentPathMaps,
  mergeDepartmentPathMaps,
  toDepartmentPathMaps,
} from './utils/department/departmentPath';
export type { DepartmentPathMaps } from './utils/department/departmentPath';
export {
  flattenDepartments,
  findDepartmentRootId,
  collectDepartmentIds,
  getNormalUserAccessibleDepartmentIds,
  extractDepartmentSubtree,
  getNormalUserDepartmentTree,
  intersectDepartmentIds,
} from './utils/department/departmentScope';
export type { DepartmentTreeNode, FlatDepartment } from './utils/department/types';
export {
  EMPLOYEE_ID_SIX_DIGIT_PATTERN,
  EMPLOYEE_ID_FORMAT_MESSAGE,
  employeeIdFormatRule,
  isValidEmployeeIdFormat,
} from './utils/user/employeeId';
export {
  normalizeRawPersonList,
  normalizePersonDtos,
  resolvePersonDepartmentName,
  toPersonOptions,
  toReviewerPersonOptions,
  formatPersonValueLabel,
  toPersonSelectOptions,
  buildPersonOptionLookup,
  resolveSelectPersonOption,
  createPersonSelectFilter,
  matchPersonOptionSearch,
} from './utils/personOption';
export type { PersonOptionDto, ReviewerOptionDto, PersonSelectOption } from './utils/personOption';

// Components
export * from './components/Auth';
export * from './components/Descriptions';
export * from './components/Empty';
export * from './components/File';
export * from './components/Filter';
export * from './components/Form';
export * from './components/Layout';
export * from './components/Modal';
export * from './components/Stat';
export * from './components/Table';
export * from './components/Tag';
export * from './components/TooltipInfo';
export * from './components/Tour';
export { default as CommonUpload } from './components/Upload';
export type { CommonUploadProps, CommonUploadRef, UploadVariant } from './components/Upload';
export * from './components/VirtualScrollbar';
export * from './components/Icons';
export * from './components/Sparkline';
export * from './components/LlmFormattedText';

// AgentHub
export { default as AgentHubAccessGuard } from './components/AgentHub/AgentHubAccessGuard';
export { default as AgentHubIndexRedirect } from './components/AgentHub/AgentHubIndexRedirect';
export { default as AgentHubSessionAccessGuard } from './components/AgentHub/ChatSessionAccessGuard';
export type * from './components/AgentHub/types';
export * from './components/AgentHub/Chat';
export * from './components/AgentHub/KnowledgeBase';
