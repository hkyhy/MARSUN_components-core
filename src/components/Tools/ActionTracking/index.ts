/**
 * ActionTracking（布局壳 + 纯函数）。
 * 业务 Form（新建/下发/认领/跟进/取消）归属各 App，勿在本库复活。
 * 见 BOUNDARY.md
 */
export { default as ActionTrackingShell } from './Shell';
export type { ActionTrackingShellProps } from './Shell';

export {
  ActionFilterBar,
  ActionListTable,
  defaultCreatedRange,
  normalizeActionFilters,
  canQueryActionList,
  resetActionFiltersToDefault,
} from './List';
export type {
  ActionFilterBarProps,
  ActionListTableProps,
  ActionListFilters,
  ActionListRowBase,
  ActionListSelectOption,
  ActionListColumns,
  ActionListEmptyConfig,
} from './List';

export { sanitizeActionHtml, isActionExecuteHidden } from './utils';
export type { ActionExecuteGateRow, ActionExecuteGateOptions } from './utils';
