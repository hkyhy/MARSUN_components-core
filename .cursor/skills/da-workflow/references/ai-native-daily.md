# AI Native 日常操作（Agent）

> 培训全文（marsun_arch SSOT）：`/Users/edy/Documents/workSpace/frontEnd/Marsun/marsun_arch/docs/AI_Native_开发培训手册-20260728.md`  
> 速查：同仓 `docs/开发规范速查.md` · 总控：[../SKILL.md](../SKILL.md)  
> 元仓库同构副本：`marsun_arch/.cursor/skills/da-workflow/references/ai-native-daily.md`

三句话：**任务在 Plane，提交走 DA，AI 是生产力不是玩具。**（考核/定档见手册第七部分，本文件不展开。）

---

## 1. 四件工具与三个概念

| 工具   | 记住这一句                                 |
| ------ | ------------------------------------------ |
| Plane  | 研发真相源——上看得到的才算数               |
| DA     | 认领→提交→关单的唯一入口                   |
| Cursor | 写方案、产代码                             |
| 钉钉   | 日常默认不进钉；P1 或对齐业务表时才打 ding |

**别混**：

| 概念   | 含义                          |
| ------ | ----------------------------- |
| Brief  | `da day start` 建议今天做什么 |
| Focus  | `da task use` 实际绑定的任务  |
| 钉表行 | 业务侧投影                    |

**Focus vs WIP**：习惯上同一时间只 Focus **一个**任务；服务端进行中 Issue 上限见 [wip-limit.md](wip-limit.md)，**不是**把 WIP 改成 1。

---

## 2. 每日标准动作

```bash
da day start
# 无 Focus → 先「会话 Focus 绑定」（§2.1），再编码
da task use <ID>
# ... 编码（先五句话方案，见 §4）...
da standards scan
da standards commit --yes --subject "type(scope): 描述" --task <ID>
da task timeline-sync <ID> --repo .
da task done <ID> --confirm --repo .
# WorkRecord（有大事文档时）→ da pm sync PATCH（plane_ready）
da day close --confirm
# 用户若要求日报 → work-record「当日日报」→ WorkRecord/{月}/{owner}/日报-{YYYY-MM-DD}.md
```

plane_ready 闭环细则：[plane-timeline.md](plane-timeline.md)。关联细则：[task-relationships.md](task-relationships.md)。CLI 一日流亦见全局 rule `da-cli`。日报规范：`marsun_arch/.cursor/skills/work-record/SKILL.md`「四·附、当日日报」或本机 `~/.cursor/skills/work-record`。

### 2.1 会话 Focus 绑定（钉表优先 · Agent 择优 ABC）

**触发**：开工 / `@da 开始` / 无 Focus / 用户明确要写码。**不**对每条闲聊弹窗。

**锚点**：以华茂**钉表** depth-2+ 事项为 SSOT（Plane 上 `origin: dingtalk` / 已有 `plane_issue_id` / `P*.*.*`·`S*.*.*` 等）。候选来自 Brief、`da task list`、snapshot——优先钉表映射项。元仓库详文亦可对照 `marsun_arch/.../da-workflow/references/ai-native-daily.md` §2.1。

**Plane UI 对照**（Issue 页操作栏）：

| UI               | 台账 / 动作                                                                   | 语义                     |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------ |
| （认领已有）     | `da task use`                                                                 | 本次 = 该 Issue 本身     |
| **添加子工作项** | YAML `parent_issue` → `da pm sync` 幂等 PATCH `parent`                        | 层级：钉表下的分解/增量  |
| **添加关系**     | `note.related_tasks` / `Related:` → sync 幂等 `relates_to`（`blocks` 仍人工） | 非层级：依赖、并行、互指 |

**ABC（Agent 先择优推荐 + 理由，用户确认或改选；禁止静默建单）**：

| 码              | 路径                                                                                          | 何时判定                                                                |
| --------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **A. 认领**     | `da task use <钉表/映射 id>`；`Task:` = 该 id                                                 | 交付范围 = 钉表该行（或本仓已映射同号）本身                             |
| **B. 子工作项** | 新建细粒度；`parent_issue` = 父 UUID；`Refs:`；父仅 `related_tasks` 互指；`Task:` = **子 id** | 该钉表大颗粒下的可验收增量（子功能、部署/seed、联调、修 bug、剩余工作） |
| **C. 添加关系** | 新建或已有；**不**误挂 `parent_issue`（或父另有所属）；`related_tasks` 互指                   | 相关/依赖/并行/阻塞，**非**隶属该钉表行                                 |

**稍后绑定**：仅讨论/读代码；**提交前**必须回到已确认的 A/B/C。

**择优口诀**：锚定钉表 → 是该行本身？**A** → 是其下增量？**B** → 只是相关？**C** → 拿不准则 AskQuestion 高亮推荐项，须用户确认。Module 拿不准（尤其 my-plane）按 [task-naming · P6 Module 分工](task-naming.md#p6-module-分工防乱挂) 选 P6.8/P6.9/P6.11/P6.12；**禁止**把产品/TOS 卡当杂项塞进 **P6.12**。

确认话术示例：

> 建议 **B 子工作项**：本次是 `S3.3.26` 下的「筛选联调」增量，将新建细粒度并挂父。可改选 A 认领整条 / C 仅添加关系。

**硬停止**：静默 `task new`；B 用父 id 作 `Task:` 或并父 note；`CREATE module` / `M*`；把绑定当成必须打 `ding` 标签（B1/B2 收口另判）；**静默选 Module / 乱挂 P6.12**。

**钉表事项 vs `ding` 标签**：前者选父/认领；后者是否 export——勿混。

---

## 3. 红线

1. **禁止裸 `git commit -m` / `--no-verify`** — 唯一入口 `da standards commit`
2. **Commit 正文必须有 `Task: <ID>`** — 禁止用分支名冒充
3. **关单必须两步** — `timeline-sync` + `done --confirm`；只改状态不算完成
4. **Plane 卡片完整** — 新/进行中台账须有 `milestone`+`owner`+日期；层级增量须 `parent_issue` + note `Refs:`/`related_tasks:`；sync 后详情禁止「无模块」、标题禁止塌成 `*.1`、有关联时「添加关系」须可见（见 [task-relationships](task-relationships.md)；`validate_manifest` 硬拦）

---

## 4. Vibe Coding 四步法

1. **双窗口并发**：长任务（A）与短活（B）分工作区/分支；不空等进度条。
2. **先方案后代码**：动手前五句话——做什么、输入、输出、约束、验收（≤5 条可当场检验）。
3. **任务原子化**：一 Plane Issue ≈ 一 Cursor 窗口 ≈ 约 25 分钟可验收结果。
4. **卡壳 ≥30 分钟**：若下次还会遇到 → 15 分钟内写 Skill 草稿到 `.skills/draft/<场景>.md`（模板见手册附录 B）。

### 4.1 会话与提示词（控用量）

额度浪费多半来自**长会话 + 全量任务 + 同窗反复 Implement**，不是某一句措辞。详文与人/Agent 模板：[cursor-session-prompt-会话与提示词.md](cursor-session-prompt-会话与提示词.md)。

**必守摘要**：

| 做                                                 | 不做                                 |
| -------------------------------------------------- | ------------------------------------ |
| 一事一会话；新需求 / 新仓 / 新 Plan → **新开聊天** | 百轮长窗里叠调研→多仓→提交           |
| 提示词写清路径边界 + 验收 ≤5                       | 只回「继续 / 需要 / 确认」续命上下文 |
| 齐套 / 循环验证 **本轮只验一项**                   | 一句「全部 / 所有 / 齐套」拉满子代理 |
| 提交 / Plane 闭环用**短会话**或声明只交付          | 开发长上下文末尾硬叠整套 `@da`       |
| 问答用 Auto / 轻量；多文件再用 Composer / 高端     | 闲聊也开最贵模型                     |

**Agent（硬约束）**：会话过长或提示词不合规（缺边界、空转「继续」、全量未拆、长窗上提交等）→ **本轮必须先给用户可见的 ⚠️ 会话提示**（问题 + 理由 + 建议新开/收窄），禁止静默继续高耗路径。触发表与话术见 [cursor-session-prompt §1.1](cursor-session-prompt-会话与提示词.md)。能定点读文件则不启 explore；禁止无必要并行子代理。

### 沉淀分工

| 类型                      | 写入                                                     |
| ------------------------- | -------------------------------------------------------- |
| 可复用前端/后端工程踩坑   | 项目 `frontend-dev-spec` / `backend-dev-spec` references |
| 团队可复用操作 Skill 草稿 | `.skills/draft/` → 双月评审转正                          |
| 仅本事项                  | WorkRecord 进展一行                                      |

禁止另建「踩坑大全」第二真相源。

---

## 5. AI 自查与禁喂

提交前自查（细则并入 [vibe-guard.md](vibe-guard.md)）：库/API/字段真实存在；边界；异常与密钥/SQL；测试本人跑过；删过度设计。

**永远不喂给 AI**：密钥/Token、真实用户数据、未公开经营数据。

---

## 6. 对外两页纸（摘要）

给业务/客户：第一页电梯演讲；第二页架构 ≤6 框 + 关键接口 ≤5 行 + 风险。全文见培训手册第六部分与附录 C。
