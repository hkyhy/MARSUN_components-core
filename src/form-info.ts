/**
 * 子路径 `@hkyhy/marsun-components-core/form-info`：一站式壳层 + 字段 + 引擎 hooks + helpers。
 */
export * from './components/FormInfo';

/** helpers：实现仍在 Form/ */
export { default as FormDataSync } from './components/Form/FormDataSync';
export type { FormDataSyncProps } from './components/Form/FormDataSync';
export { default as FetchSelect } from './components/Form/FetchSelect';
export type { FetchSelectProps, SelectOptionItem } from './components/Form/FetchSelect';
export { default as FetchTreeSelect } from './components/Form/FetchTreeSelect';
export type { FetchTreeSelectProps, TreeNodeOption } from './components/Form/FetchTreeSelect';
export { default as PersonOptionRow } from './components/Form/PersonOptionRow';
export type { PersonOptionRowProps } from './components/Form/PersonOptionRow';

/** 引擎 hooks / GroupList / RULES：从 Form/ 再导出 */
export {
  useFormApi,
  useFormContext,
  useField,
  useSubmit,
  useReset,
  useGroup,
  GroupList,
  RULES,
  ReactForm,
} from './components/Form/kneReactForm';
export type { GroupListRenderProps } from './components/Form/kneReactForm';

export { normalizeLabelTips, withNormalizedLabelTips } from './components/Form/normalizeLabelTips';
