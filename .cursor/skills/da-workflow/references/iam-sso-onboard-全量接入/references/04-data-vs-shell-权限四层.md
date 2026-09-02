# 权限四层模型：数据 vs 壳

> 本文件 = 权限码该挡菜单还是挡 API 还是缩数据的决策表。
> 核心问题：「这个权限码该挡菜单还是挡 API 还是缩数据？」

## 四层决策表

| 层        | 来源                                       | 作用                                    | 示例                                     | 谁负责                                                    |
| --------- | ------------------------------------------ | --------------------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| 菜单码    | EP `permissions[].code`（category=menu）   | 侧栏/路由可见                           | `s3:menu:alerts`                         | FE route guard + BE 读 API `requirePermission`            |
| 动作码    | EP `permissions[].code`（category=action） | 按钮可见 + **写 API requirePermission** | `s3:action:claim`                        | FE button `hasPermission` + BE 写 API `requirePermission` |
| dataScope | EP `dataScope`（SELF/ORG_TREE/COMPANY）    | **列表/统计 SQL where**                 | `where: { uploaderId: userId }`          | BE adapter（Prisma/ORM where）                            |
| tenantId  | JWT `tenantId`                             | **强制行级过滤**（正交于上三层）        | `where: { tenantId, ...dataScopePatch }` | BE middleware（永远在）                                   |

## 为什么不能只藏按钮

示例：FE 藏了「删除」按钮，但 BE 接口没挂 `requirePermission` → 直接 `curl` 仍能调。

```python
# 错误：只 FE 藏按钮
@router.delete("/records/{id}")  # 无 require_permission
async def delete_record(id: str): ...

# 正确：BE 也挂码
@router.delete("/records/{id}", dependencies=[require_permission(PERM_RECORD_DELETE)])
async def delete_record(id: str): ...
```

**必须 BE 也挂码**：FE 藏按钮只是体验，BE `requirePermission` 才是安全边界。

## dataScope 与 tenantId 同时生效示例

`tenantId` 永远在 `where`；`dataScope` 在其上再收窄。

```typescript
// Prisma where 片段（Assets 风格）
const where: Prisma.FileWhereInput = {
  tenantId,  // ← 永远在（租户隔离，正交于 dataScope）
  // ... dataScope patch ...
  if (effective === 'SELF') {
    where.uploaderId = userId;
  } else if (effective === 'ORG_TREE') {
    where.departmentId = { in: orgTreeIds };
  }
  // COMPANY: 不加额外条件（仍受 tenantId 约束）
};
```

```python
# FastAPI/SQLAlchemy 风格（S3 风格）
stmt = select(Record).where(Record.tenant_id == tenant_id)  # 永远在
if data_scope == 'SELF':
    stmt = stmt.where(Record.owner_id == user_id)
elif data_scope == 'ORG_TREE':
    stmt = stmt.where(Record.dept_id.in_(org_tree_ids))
# COMPANY: 不加额外条件
```

> 强调：`tenantId` 永远在；`dataScope` 在其上再收窄。COMPANY 不是「跨租户上帝视角」，是「本租户内全部」。

## dual/iam/off 模式下各层行为

| 层        | dual                                              | iam                                 | off（仅 DEMO）                        |
| --------- | ------------------------------------------------- | ----------------------------------- | ------------------------------------- |
| 菜单码    | FE 按 EP 显示；BE 读 API 挂码但不硬拒（观测）     | FE 按 EP 显示；BE 读 API 缺码 → 403 | 跳过 PEP                              |
| 动作码    | FE 按 EP 显示按钮；BE 写 API 挂码但不硬拒（观测） | FE 按 EP 显示；BE 写 API 缺码 → 403 | 跳过 PEP                              |
| dataScope | 按 EP.dataScope 过滤                              | 按 EP.dataScope 过滤                | 不过滤（危险）                        |
| tenantId  | 强制                                              | 强制                                | 强制（tenantId 不受 authz mode 控制） |

> 非 DEMO 禁 off：`effective_s3_iam_authz_mode()` 会强制回落 dual。
> tenantId 不受 authz mode 影响：即使 off，tenantId 过滤仍在（租户隔离是独立红线）。
