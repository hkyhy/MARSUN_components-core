/**
 * @kne/super-select SelectTree 双轨不一致：
 * - 展示用 parseTreeData：只认扁平 parentId（嵌套 children 会被丢掉 → switcher-noop）
 * - 勾选联动用 mapping.processData：原版扁平时会把 parentId 写成 null（父子勾选失效）
 * 故嵌套树须先展平；processData 保留 parentId 见 scripts/patch-kne-super-select.mjs（postinstall）。
 */
export default function flattenSelectTreeOptions(
  options,
  { valueKey = 'id', parentKey = 'parentId', childrenKey = 'children' } = {},
) {
  if (!Array.isArray(options) || options.length === 0) {
    return Array.isArray(options) ? options : [];
  }

  const hasNested = options.some(
    (item) => item && Array.isArray(item[childrenKey]) && item[childrenKey].length > 0,
  );
  if (!hasNested) {
    return options;
  }

  const out = [];
  const walk = (nodes, forcedParentId) => {
    for (const node of nodes || []) {
      if (!node || typeof node !== 'object') continue;
      const children = Array.isArray(node[childrenKey]) ? node[childrenKey] : [];
      const rest = { ...node };
      delete rest[childrenKey];
      const parentId = forcedParentId !== undefined ? forcedParentId : (rest[parentKey] ?? null);
      out.push({ ...rest, [parentKey]: parentId });
      if (children.length > 0) {
        walk(children, node[valueKey]);
      }
    }
  };
  walk(options, undefined);
  return out;
}
