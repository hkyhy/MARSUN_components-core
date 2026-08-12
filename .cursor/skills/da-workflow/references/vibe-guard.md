# Vibe Guard 安全清单

> 总控：[../SKILL.md](../SKILL.md) · 全局 skill：`~/.cursor/skills/vibe-guard-workflow/SKILL.md`

## 提交前（Agent 必做）

1. `da standards scan` — `.env` **硬拦**；密钥/反模式 warn 或 strict
2. 审查 diff：是否超出任务范围？是否硬编码密钥？
3. `da standards commit` — 含 `Task:`；Agent 编辑会自动加 `AI-Assisted: true`

## Cursor Agent 编辑后

Hook 检测近 **2h** 内 `afterFileEdit`（agent_loc>0）→ 强制 message 含：

```
AI-Assisted: true
```

## 安全清单

- [ ] 无 `.env` / 密钥 / 私钥进暂存区
- [ ] 无 SQL 拼接、无裸 stack trace 返回
- [ ] 无空 catch、无调试 `console.log`
- [ ] 新依赖有说明
- [ ] **生产操作**：遵守 `prod-safety` rule（备份 → 定向变更 → 可回滚；不碰同机其他服务）

## AI 产出自查（手册第五节）

- [ ] 引入的库 / API / 字段在仓库里真实存在（禁幻觉版本号）
- [ ] 空值、0、超大数据量等边界已处理
- [ ] 异常有明确策略（吞 / 日志 / 上抛）；无硬编码密钥、无 SQL 拼接
- [ ] 测试是**本人跑过**，不是 AI 声称跑过
- [ ] AI 顺手加的过度设计已删（删掉不影响功能则删）

**写代码门禁（前后端自动化测试 + 自检流水线）**：见 [test-and-selfcheck-写代码自检与测试.md](test-and-selfcheck-写代码自检与测试.md)——前端 vitest、后端契约用例、`da standards scan` 须在 commit 前过关。

**永远不喂给 AI**：密钥和 Token、真实用户数据、未公开的经营数据。贴代码前敏感信息换占位符。详见 [ai-native-daily](ai-native-daily.md)。

## 命令

```bash
da standards init    # 一次：rules + .da/standards.json + docs
da standards scan
da standards commit
```

## Husky 仓库

本地 `core.hooksPath=.husky/_` 会覆盖全局 DA hooks。`da project init` / `da standards install-hooks` 会在 `.husky/` 自动链接 `pre-commit`（scan → lint-staged）、`commit-msg`、`prepare-commit-msg`（Task 硬拦 + AI 归因）。

仅全局 hooks 就绪但 doctor 仍 ✗ 时，在该仓库重跑 `da standards install-hooks`。
