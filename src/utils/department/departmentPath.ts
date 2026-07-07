import type { DepartmentTreeNode, FlatDepartment } from './types';

/** 从部门树构建 id → 完整路径（父/子）映射 */
export function buildDepartmentPathMapFromTree(
  tree: DepartmentTreeNode[],
  parentPath = '',
): Map<string, string> {
  const map = new Map<string, string>();
  for (const dept of tree) {
    const path = parentPath ? `${parentPath}/${dept.name}` : dept.name;
    map.set(dept.id, path);
    if (dept.children?.length) {
      const childMap = buildDepartmentPathMapFromTree(dept.children, path);
      for (const [k, v] of childMap) map.set(k, v);
    }
  }
  return map;
}

/** 从扁平部门列表构建 id → 完整路径映射 */
export function buildDepartmentPathMapFromFlat(departments: FlatDepartment[]): Map<string, string> {
  const nameMap = new Map(departments.map((d) => [d.id, d.name]));
  const parentMap = new Map(departments.map((d) => [d.id, d.parentId]));
  const pathMap = new Map<string, string>();

  const resolve = (id: string): string => {
    const cached = pathMap.get(id);
    if (cached) return cached;

    const name = nameMap.get(id) ?? '';
    const parentId = parentMap.get(id);
    if (!parentId) {
      pathMap.set(id, name);
      return name;
    }

    const path = `${resolve(parentId)}/${name}`;
    pathMap.set(id, path);
    return path;
  };

  for (const dept of departments) {
    resolve(dept.id);
  }
  return pathMap;
}

/** 根据路径映射解析部门完整路径 */
export function getDepartmentPath(
  pathMap: Map<string, string>,
  departmentId?: string | null,
  fallback = '-',
): string {
  if (!departmentId) return fallback;
  return pathMap.get(departmentId) || fallback;
}

/** 部门路径映射（id → 全路径，以及唯一叶子名 → 全路径） */
export interface DepartmentPathMaps {
  byId: Map<string, string>;
  byUniqueLeaf: Map<string, string>;
}

/** 从 id 路径映射构建「唯一叶子部门名 → 全路径」索引（无 departmentId 时的兜底） */
export function buildLeafDepartmentPathMap(pathMap: Map<string, string>): Map<string, string> {
  const result = new Map<string, string>();
  const ambiguous = new Set<string>();

  for (const path of pathMap.values()) {
    const leaf = path.includes('/') ? path.slice(path.lastIndexOf('/') + 1) : path;
    if (ambiguous.has(leaf)) continue;

    const prev = result.get(leaf);
    if (prev !== undefined && prev !== path) {
      ambiguous.add(leaf);
      result.delete(leaf);
    } else {
      result.set(leaf, path);
    }
  }
  return result;
}

export function buildDepartmentPathMaps(departments: FlatDepartment[]): DepartmentPathMaps {
  const byId = buildDepartmentPathMapFromFlat(departments);
  return { byId, byUniqueLeaf: buildLeafDepartmentPathMap(byId) };
}

export function mergeDepartmentPathMaps(...maps: Map<string, string>[]): Map<string, string> {
  const merged = new Map<string, string>();
  for (const map of maps) {
    for (const [k, v] of map) merged.set(k, v);
  }
  return merged;
}

/** 将 useDepartmentPath 的 pathMap 包装为完整解析结构 */
export function toDepartmentPathMaps(
  pathMap?: Map<string, string>,
): DepartmentPathMaps | undefined {
  if (!pathMap || pathMap.size === 0) return undefined;
  return { byId: pathMap, byUniqueLeaf: buildLeafDepartmentPathMap(pathMap) };
}
