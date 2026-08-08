// @ts-nocheck
export const isFilterListItem = (item) => {
  if (!item) return false;
  if (typeof item === 'function') return true;
  return !!item.type;
};

export const isNestedFilterList = (list) => {
  if (!Array.isArray(list) || list.length === 0) return false;
  return Array.isArray(list[0]) && !isFilterListItem(list[0]);
};

export const normalizeFilterList = (list) => {
  const safeList = Array.isArray(list) ? list : [];
  if (!safeList.length) {
    return { mode: 'flat', items: [], lines: [] };
  }
  if (isNestedFilterList(safeList)) {
    return { mode: 'nested', items: [], lines: safeList };
  }
  return { mode: 'flat', items: safeList, lines: [] };
};

export const getMobileFilterList = (list) => {
  const { mode, items, lines } = normalizeFilterList(list);
  if (mode === 'flat') return items;
  return lines.reduce((result, line) => result.concat(line), []);
};
