// @ts-nocheck
/**
 * Filter 稳定全局类名（供调用方 CSS 选择器定制内部样式）。
 * 根节点：`react-filter`；内部节点为短类名，用 `.react-filter .xxx` 限定作用域。
 * CSS Modules 类仍负责默认样式；此类名并行挂载。
 */
export const FILTER_CLASS = {
  root: 'react-filter',
  isMobile: 'is-mobile',
  title: 'title',
  label: 'label',
  list: 'list',
  listScrollWrap: 'list-scroll-wrap',
  listScroll: 'list-scroll',
  line: 'line',
  extra: 'extra',
  more: 'more',
  moreRow: 'more-row',
  children: 'children',
  itemWrap: 'item-wrap',
  item: 'item',
  itemActive: 'is-active',
  itemVisited: 'is-visited',
  itemLabel: 'item-label',
  itemIcon: 'item-icon',
  itemField: 'item-field',
  valueDisplay: 'value-display',
  valueTag: 'value-tag',
  valueTagLabel: 'value-tag-label',
  valueTagContent: 'value-tag-content',
  valueActions: 'value-actions',
  valueClear: 'value-clear',
  valueToggle: 'value-toggle',
  advanced: 'advanced',
};

export default FILTER_CLASS;
