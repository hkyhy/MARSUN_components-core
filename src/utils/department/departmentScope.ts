import type { DepartmentTreeNode } from './types';

interface DeptNode {
  id: string;
  parentId: string | null;
}

/** 将树形部门展平 */
export function flattenDepartments(tree: DepartmentTreeNode[]): DeptNode[] {
  const result: DeptNode[] = [];
  const walk = (nodes: DepartmentTreeNode[]) => {
    for (const node of nodes) {
      result.push({ id: node.id, parentId: node.parentId });
      if (node.children?.length) walk(node.children);
    }
  };
  walk(tree);
  return result;
}

/** 查找部门所属组织链的根节点 ID */
export function findDepartmentRootId(departmentId: string, departments: DeptNode[]): string {
  const map = new Map(departments.map((d) => [d.id, d]));
  let current = departmentId;
  while (true) {
    const dept = map.get(current);
    if (!dept?.parentId) return current;
    current = dept.parentId;
  }
}

/** 收集部门及其所有子部门 ID */
export function collectDepartmentIds(rootId: string, departments: DeptNode[]): string[] {
  const ids = new Set<string>([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const dept of departments) {
      if (dept.parentId && ids.has(dept.parentId) && !ids.has(dept.id)) {
        ids.add(dept.id);
        changed = true;
      }
    }
  }
  return Array.from(ids);
}

/** 普通用户可访问的部门 ID（所属组织链根节点及其子树） */
export function getNormalUserAccessibleDepartmentIds(
  userDepartmentId: string,
  departments: DeptNode[],
): string[] {
  const rootId = findDepartmentRootId(userDepartmentId, departments);
  return collectDepartmentIds(rootId, departments);
}

/** 从完整部门树中提取指定根节点的子树 */
export function extractDepartmentSubtree(
  rootId: string,
  tree: DepartmentTreeNode[],
): DepartmentTreeNode[] {
  const findNode = (nodes: DepartmentTreeNode[]): DepartmentTreeNode | undefined => {
    for (const node of nodes) {
      if (node.id === rootId) return node;
      if (node.children?.length) {
        const found = findNode(node.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  const node = findNode(tree);
  return node ? [node] : [];
}

/** 普通用户部门筛选树：仅保留所属组织链 */
export function getNormalUserDepartmentTree(
  userDepartmentId: string,
  tree: DepartmentTreeNode[],
): DepartmentTreeNode[] {
  if (!tree.length) return [];
  const flat = flattenDepartments(tree);
  const rootId = findDepartmentRootId(userDepartmentId, flat);
  return extractDepartmentSubtree(rootId, tree);
}

/** 在权限范围内应用部门筛选（scopeRoot 为当前用户可管理的部门根） */
export function intersectDepartmentIds(
  scopeRootId: string,
  filterDepartmentId: string | undefined,
  departments: DeptNode[],
): string[] {
  const scopeIds = new Set(collectDepartmentIds(scopeRootId, departments));
  if (!filterDepartmentId) return Array.from(scopeIds);
  return collectDepartmentIds(filterDepartmentId, departments).filter((id) => scopeIds.has(id));
}
