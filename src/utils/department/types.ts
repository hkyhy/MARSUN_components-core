/** 部门树节点最小字段（纯算法用） */
export interface DepartmentTreeNode {
  id: string;
  name: string;
  parentId: string | null;
  children?: DepartmentTreeNode[];
}

export interface FlatDepartment {
  id: string;
  name: string;
  parentId: string | null;
}
