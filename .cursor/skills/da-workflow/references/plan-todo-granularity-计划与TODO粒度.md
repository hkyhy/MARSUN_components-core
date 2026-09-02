# Plan / TODO 粒度（CreatePlan 必守）

> 挂接：[cursor-session-prompt](cursor-session-prompt-会话与提示词.md) · [mindset](mindset-角色大前提.md) · 前端 [requirement-workflow](../../frontend-dev-spec/references/prompts/requirement-workflow-需求工作流.md)  
> 触发：任何 **CreatePlan / 更新 Plan / Plan 模式定稿**（含用户说「写计划」「出方案」）。

## 1. 为什么要细

粗 TODO（「改 Toolbar + Hook」「做完 CRUD」）无法跟踪进度、难并行拆验、Implement 时易漏角色循环「必须改」项。用户硬约束（2026-08-25）：**Plan 的 TODO 尽量细；以后所有 Plan 同标准。**

## 2. 粒度标准（硬）

| 要求                                 | 说明                                                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **一条 TODO ≈ 一次可独立完成的小步** | 优先「单文件 / 单职责 / 可勾选」；禁止把整模块塞进一条                                                 |
| **content 可验收**                   | 写清产物或行为（如「删 mode Segmented」），禁止「处理一下」「完善逻辑」                                |
| **id 稳定短横线**                    | 如 `hook-remove-mode`、`bands-panel-statebar`                                                          |
| **数量**                             | 中等前端改版常见 **12～25** 条；少于 5 条且跨多文件 → **过粗，须再拆**                                 |
| **顺序**                             | frontmatter todos 按依赖排序；正文可写「实现顺序」映射 id                                              |
| **角色循环项**                       | 用户已接受的必须改/建议改 → **各落成独立 TODO 或明确并入某条 content**，禁止只写在正文表格里不进 todos |

## 3. 反例 → 正例

| 过粗（禁止）  | 宜拆                                                                                   |
| ------------- | -------------------------------------------------------------------------------------- |
| `改月报交互`  | `toolbar-slim` / `list-group-statebar` / `bands-panel-statebar` …                      |
| `对比组 CRUD` | `form-compare-group` → `modal-edit-patch` → `list-group-statebar` → `list-group-empty` |
| `单测+文档`   | `util-tests-gate-options` + `workrecord-progress` + `vitest-final`                     |

## 4. Plan 正文仍要定案

细 TODO **不替代**正文：定案表、非本任务、角色循环结论、关键路径仍须写清。TODO 是执行勾选清单，不是需求说明书的替代。

## 5. Agent 自检（CreatePlan 前）

- [ ] todos ≥ 改动文件数的粗量级，或每条能对应「打开一个文件改完」
- [ ] 无「A 和 B 和 C」并列在同一 content（应拆三条）
- [ ] 角色循环已确认项已映入 todos
- [ ] 有收尾：`vitest` / WorkRecord / 手工清单（按任务需要）
