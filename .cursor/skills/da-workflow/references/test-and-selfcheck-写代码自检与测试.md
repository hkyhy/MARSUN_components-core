# 写代码自检与自动化测试门禁

> 总控：[../SKILL.md](../SKILL.md) · 安全细则：[vibe-guard.md](vibe-guard.md)  
> 前端细则：[frontend-dev-spec · testing](../../frontend-dev-spec/references/common/testing-测试规范.md) · [requirement-workflow](../../frontend-dev-spec/references/prompts/requirement-workflow-需求工作流.md)  
> 后端细则：[backend-dev-spec · openapi-apifox §4/§6](../../backend-dev-spec/references/common/openapi-apifox-契约标注.md)

**定位**：Agent / 人写代码时的**统一门禁**。前端 vitest、后端契约测试用例、`da standards scan` 此前分散在各 Skill；本文件规定**何时跑、跑什么、不过不交**。

---

## 1. 流水线（编码 → 提交）

```text
改代码 / 写契约
    │
    ├─ 前端改动 ──► 同任务补/改 __tests__ ──► npm run test（或 vitest run 相关文件）
    ├─ 接口改动 ──► 同任务 backend-dev 三件套 + 测试用例 ──► 本人跑通成功用例（curl/脚本）
    ├─ 实现仓改动 ──► 项目文档写明的 verify/pytest/jest 等（有则必跑，与契约用例双轨）
    └─ 任意改动 ──► AI 产出自查（§3）──► da standards scan ──► da standards commit
```

**硬规则**（对齐 frontend-dev-spec #43 · backend-dev-spec 硬约束 #6）：

1. **禁止**以「AI 声称测过」代替本人执行命令；日志/退出码须可见。
2. **禁止**跳过 `da standards scan` 或用 `--no-verify` 绕过 hook。
3. 前端新组件无测试、接口无用例 → **不得**标任务完成（可 `[WIP]` 提交中间态）。
4. 仓库有 `make verify` / `pytest` / `pnpm lint` / 项目文档写明的验证命令时，**优先跑项目命令**，再跑本门禁最小集；契约用例与实现仓自动化**不互相替代**。

---

## 2. 分轨：前端 / 后端 / 契约

### 2.1 前端（React 业务仓 · components-core）

| 时机                | 动作                                                 | SSOT                                                                                                  |
| ------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 新建组件 / 改纯逻辑 | 同目录 `__tests__/{Name}.test.tsx`                   | [testing-测试规范](../../frontend-dev-spec/references/common/testing-测试规范.md)                     |
| 提交前              | `npm run test` 或 `npx vitest run <path>` 通过       | 同上 §10                                                                                              |
| 完成前              | requirement-workflow「完成前检查清单」含「测试通过」 | [requirement-workflow](../../frontend-dev-spec/references/prompts/requirement-workflow-需求工作流.md) |

原则摘要：纯逻辑优先单测；组件最小化 mock；Form 勿在 `it()` 里直接调 Hook。

### 2.2 后端 / BFF / 数据服务（契约 + 实现双轨）

| 轨       | 时机                           | 动作                                                               | SSOT                                                                                                    |
| -------- | ------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| **契约** | 新接/改造 REST                 | 同任务 `接口.md` + OpenAPI + **测试用例**                          | [openapi-apifox §3–§4](../../backend-dev-spec/references/common/openapi-apifox-契约标注.md) · 硬约束 #6 |
| **契约** | 用例最低集                     | 每 operation ≥1 条成功；声明的错误路径补 400/空页/404              | 同上 §4.1                                                                                               |
| **契约** | 提交前                         | 本人执行用例中的 curl/脚本；信封 `code === 0` 或文档声明的扁平字段 | 同上                                                                                                    |
| **契约** | OpenAPI 自检                   | §6 清单（title/description/folder/落点）全勾                       | 同上 §6                                                                                                 |
| **实现** | 改 BFF/data-service/Agent 代码 | 跑该仓文档写明的 `pytest` / `make verify` / 等价命令（有则必跑）   | 各实现仓 README / 发布与测试                                                                            |

说明：`backend-dev` 测试用例是**联调验收清单**；实现仓自动化是**代码回归**——两轨都有时两条都过，缺一不可用「另一条过了」抵消。

### 2.3 规范 / 台账仓（marsun_arch 等）

- 无业务单测时：仍须 `da standards scan` + vibe-guard 自查。
- 改契约文档视同后端轨（三件套与用例同步）。

---

## 3. 加强自检（提交前必勾）

合并 [vibe-guard · AI 产出自查](vibe-guard.md) 与业务清单，**最短勾选**：

- [ ] 库 / API / 字段在仓库真实存在（禁幻觉）
- [ ] 空值、0、大数据量边界已处理
- [ ] 异常策略明确；无密钥进仓、无 SQL 拼接、无裸 stack 给客户端
- [ ] **相关自动化测试 / 契约用例本人已跑过且通过**（前端 #43 · 后端硬约束 #6）
- [ ] 前端：有对应 `.test.ts(x)`（新建组件）且 vitest 通过
- [ ] 后端：三件套 + 用例覆盖 path+method；实现仓有自动化则已跑通
- [ ] `da standards scan` 无硬拦；diff 未超出任务范围；无过度设计
- [ ] 可复用踩坑已写入对应 skill reference（禁止只留对话）

**永远不喂给 AI**：密钥/Token、真实用户数据、未公开经营数据。

---

## 4. 与一日流 / 四步法的衔接

| Vibe 步骤  | 门禁落点                                              |
| ---------- | ----------------------------------------------------- |
| 2 先方案   | 五句话里的「验收」须写清：跑哪条 test / 哪条 curl     |
| 3 原子任务 | 25min 切片结束前跑通本切片相关测试，再 commit         |
| 提交       | scan → commit（见 [commit-format](commit-format.md)） |
| 关单       | 完成前清单含测试；timeline-sync / done 不替代测试     |

---

## 5. 与角色循环验证（测试）的分工

本文件管**本人跑通命令**的门禁（有代码/用例变更则必跑命令）；[role-loop-review §2.4](role-loop-review-角色循环验证.md) 管**顶尖测试工程师视角**的复审，且仅当 [§1 触发表](role-loop-review-角色循环验证.md) 命中时才跑（未命中声明跳过）。复审通过 ≠ 免除 vitest / 契约用例 / `da standards scan`。

---

## 6. Agent 触发

写代码、改组件、改 REST、用户说「自检 / 跑测试 / 提交前检查」时：先读本文件，再打开前端 testing 或后端 openapi 专章；提交流程仍走 [SKILL.md](../SKILL.md) 第二节。角色循环验证按 [role-loop-review §1](role-loop-review-角色循环验证.md) 命中才跑（测试 §2.4 / 安全 §2.5 等），禁止无差别空跑。
