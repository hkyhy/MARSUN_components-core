// @ts-nocheck
/**
 * Vendor port of `@kne/info-page`（跳过 Label.js）。
 * Ported from https://github.com/kne-union/info-page/blob/master/src/index.js
 */
import '@kne/table-view/dist/index.css';

export { default } from './InfoPage';
export { default as Content, default as InfoList } from './Content';
export { default as Descriptions, default as DetailList } from './Descriptions';
export { default as CentralContent, default as FieldView } from './CentralContent';
export { default as TableView } from '@kne/table-view';
export { default as formatView, defaultFormat } from './formatView';
export {
  default as computeColumnsValue,
  computeDisplay,
  computeColumnsDisplay,
} from './computeColumnsValue';
export { default as SplitLine } from './SplitLine';
export { default as Flow } from './Flow';
export { default as Report } from './Report';
export { default as Score } from './Score';
