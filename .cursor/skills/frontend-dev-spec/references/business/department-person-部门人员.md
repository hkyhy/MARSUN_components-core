# 部门与人员选择 Department Person

**核心原则**：筛选/表单中的部门树和人员列表默认展示**全量**数据，不按登录用户角色或所属部门裁剪选项。列表数据的可见性由后端权限单独控制，与筛选下拉的选项范围无关。

## 部门树（FilterTreeSelect）

- 使用 `FilterTreeSelect` + `showSearch`，依赖 `autoLoadDept`（默认 `true`）自动加载**完整组织架构树**
- **禁止**按角色裁剪部门树（禁止使用 `getNormalUserDepartmentTree`、`shouldScopeFileDeptTree` 等将部门领导/普通用户限制在本部门链）
- **禁止**手动传入裁剪后的 `treeData`，除非树本身不是部门数据（如文件类型树）

```tsx
<FilterTreeSelect
  filterKey="dept"
  label="部门"
  value={deptFilter}
  onChange={(v) => onDeptChange(v as string | undefined)}
  showSearch
/>
```

## 人员选择（提交人 / 负责人等）

- 后端接口（如 `GET /users/uploaders`、`GET /feedbacks/assignee-options`）返回**全部在职用户**，不得因登录用户角色强制限制为本部门
- 仅当用户在部门筛选项中**主动选择**了部门时，才向人员接口传 `departmentId` 缩小范围
- 筛选栏使用 `FilterSelect` + `variant="person"` + `searchable`
- 表单弹窗使用 `UploaderSelect` 或模块内 `AssigneeSelect` 等封装组件
- 选项展示统一复用 `PersonOptionRow`，搜索统一使用 `matchPersonOptionSearch`
- 人员选项的 `departmentName` 必须展示完整部门路径（`toPersonOptions(dto, pathMap)` / `toReviewerPersonOptions(dto, pathMap)`）

```tsx
// 筛选栏：提交人（部门筛选联动）
useEffect(() => {
  const params: Record<string, unknown> = {};
  if (deptFilter) params.departmentId = deptFilter;
  userApi.uploaders(params).then(/* toPersonOptions */);
}, [deptFilter]);

<FilterSelect
  filterKey="uploader"
  label="提交人"
  variant="person"
  options={uploaderOptions}
  searchable
/>

// 表单：负责人选择（全量在职用户）
<AssigneeSelect placeholder="请选择负责人" />
```

## 数据可见性 vs 筛选选项

| 层面          | 规则                                                       |
| ------------- | ---------------------------------------------------------- |
| 筛选/表单选项 | 部门树全量、人员列表全量（或仅受用户主动选的部门筛选影响） |
| 列表/详情数据 | 由后端 `where` 条件与权限校验控制，与下拉选项范围无关      |

## 部门完整路径展示

**核心原则**：所有面向用户的部门名称必须使用自上而下的完整层级路径（`父/子`，如 `技术部/信息部`），**禁止**仅展示叶子部门名。

| 场景           | 做法                                                                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| 列表/详情列    | `useDepartmentPath()` → `getDepartmentPath(departmentId, fallback)`                                                   |
| 筛选已选标签   | `FilterTreeSelect` 的 `valueLabel` 显示完整路径                                                                       |
| 部门表单选择   | `DepartmentSelect` 选中值显示完整路径（`treeNodeLabelProp="titleStr"`）                                               |
| 人员选项副标题 | `toPersonOptions` / `toReviewerPersonOptions` + `useDepartmentPath().pathMap` 解析完整路径，`PersonOptionRow` 展示    |
| 后端接口       | `loadDepartmentPathMap()` + `resolveDepartmentName(pathMap, departmentId, leafName)`，人员接口同时返回 `departmentId` |

```tsx
// 列表列：优先用 departmentId 解析完整路径
const { getDepartmentPath } = useDepartmentPath();

{
  title: '部门',
  render: (_, record) =>
    getDepartmentPath(record.departmentId, record.departmentName) || '-',
}
```

- 前端工具：`@/utils/department/departmentPath.ts`
- 后端工具：`server/src/utils/departmentPath.ts`
- 下拉树节点仍按层级缩进展示单级名称；**选中后、表格列、人员副标题**等扁平展示场景才用完整路径
