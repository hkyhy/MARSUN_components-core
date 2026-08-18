/** ReactFilter SuperSelect/SelectTree 弹层全局修补（进 `/styles` 产物） */
import './components/ReactFilter/superSelectPopup.scss';
/** DatePicker 月名：同一份 dayjs 注册 zh-cn（见 ensureDayjsZhCn） */
import './utils/ensureDayjsZhCn';

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
  formatDateTimeDisplay,
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
  MarsunRequestErrorResponse,
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
export * from './components/Filter';
// ReactFilter (@kne/react-filter port). FilterProvider aliased to avoid clash with Common FilterProvider.
export {
  default as Filter,
  fields as reactFilterFields,
  getFilterValue,
  useFilter as useReactFilter,
  withFilterValue,
  SearchInput as ReactFilterSearchInput,
  FilterProvider as ReactFilterProvider,
  pickSelectValues,
  createFilterValueMapper,
  useSearchParamsValue,
  filterInterceptors,
  singleSelectInterceptor,
  multiSelectInterceptor,
  FILTER_CLASS,
  AdvancedFilter,
  FilterValueDisplay,
  FilterItem as ReactFilterItem,
  FilterLines,
  FilterOuter,
  PopoverItem,
  withFieldItem,
  FilterItemContainer,
  TypeDateRangePickerField,
  NumberRangeFilterItem,
  InputFilterItem as ReactInputFilterItem,
  DatePickerFilterItem as ReactDatePickerFilterItem,
  DateRangePickerFilterItem as ReactDateRangePickerFilterItem,
  TypeDateRangePickerFilterItem,
  SuperSelectFilterItem,
  SelectTableListFilterItem,
  SelectTreeFilterItem,
  SelectCascaderFilterItem,
  SelectFunctionFilterItem,
  SelectIndustryFilterItem,
  SelectAddressFilterItem,
  SelectCascader,
} from './components/ReactFilter';
export type { FilterValueItem, FilterValue } from './components/ReactFilter';
export * from './components/Form';
export * from './components/InteractiveBlock';
export * from './components/Layout';
export * from './components/Modal';
export * from './components/Permissions';
export * from './components/PermissionBindPanel';
export * from './components/OrgTree';

export * from './components/StateBar';
export * from './components/SegmentedRadio';
export * from './components/Stat';
export * from './components/Table';
export * from './components/Tag';
export * from './components/TooltipInfo';
export * from './components/Tour';
export { default as CommonUpload } from './components/Upload';
export type {
  CommonUploadProps,
  CommonUploadRef,
  UploadListType,
  UploadVariant,
} from './components/Upload';
export * from './components/VirtualScrollbar';
export * from './components/Icons';
export * from './components/Sparkline';
/** @deprecated 迁移期：请改从 `@hkyhy/marsun-components-core/llm` import */
export * from './components/LlmFormattedText';

/** @deprecated 迁移期：请改从 `@hkyhy/marsun-components-core/file` import（含 FilePreview 等） */
export * from './components/File';

// AgentHub — @deprecated 迁移期：请改从 `@hkyhy/marsun-components-core/agent-hub` import
export { default as AgentHubAccessGuard } from './components/AgentHub/AgentHubAccessGuard';
export { default as AgentHubIndexRedirect } from './components/AgentHub/AgentHubIndexRedirect';
export { default as AgentHubSessionAccessGuard } from './components/AgentHub/ChatSessionAccessGuard';
export type * from './components/AgentHub/types';
export * from './components/AgentHub/Chat';
export * from './components/AgentHub/KnowledgeBase';
export * from './components/AgentHub/Report';
