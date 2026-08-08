/**
 * 为 @kne/super-select createTreeUtils 构建 mapping：
 * 扁平 parentId 列表需挂上 children，否则 getAllChildren 为空、父子勾选无法收敛。
 */
export default function buildSelectTreeMapping(
  options,
  { valueKey = 'id', parentKey = 'parentId', labelKey = 'name' } = {},
) {
  const map = new Map();
  if (!Array.isArray(options)) return map;

  for (const item of options) {
    if (!item || typeof item !== 'object') continue;
    const id = item[valueKey];
    if (id == null) continue;
    const parentId = item[parentKey] != null ? item[parentKey] : null;
    map.set(id, {
      ...item,
      id,
      label: item[labelKey],
      parentId,
      children: [],
    });
  }

  for (const node of map.values()) {
    if (node.parentId != null && map.has(node.parentId)) {
      map.get(node.parentId).children.push(node);
    }
  }

  return map;
}
