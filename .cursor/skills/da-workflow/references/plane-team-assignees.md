# Plane 负责人映射

> sync 解析 `milestones.yaml` / `sync_manifest.yaml` 中的 **`owner`（中文姓名）** → Plane workspace member UUID（按 `plane_email` 匹配）。  
> 配置源：`plane/team-assignees.yaml`（各 repo 可选）；缺省时使用下表。

## 团队成员

| 姓名   | GitHub 邮箱         | Plane 邮箱         |
| ------ | ------------------- | ------------------ |
| 郑鹏辉 | walkthunder@163.com | aaron@wisilk.com   |
| 黄金芳 | 2283785225@qq.com   | metacoo@wisilk.com |
| 张南   | monster@wisilk.com  | monster@wisilk.com |
| 刘军   | lj@wisilk.com       | lj@wisilk.com      |
| 王波   | 1186583076@qq.com   | wangbo@wisilk.com  |

## YAML 用法

```yaml
# milestones.yaml
owner: 黄金芳

# sync_manifest.yaml（任务级，优先于 milestone）
owner: 郑鹏辉
start_date: '2026-07-01'
target_date: '2026-07-15'
```

- **任务** 有 `owner` → sync 写入 Plane assignee（`PLANE_PUSH_ASSIGNEE=1` 或 YAML 显式 owner 时生效）
- **任务** 无 `owner` → 不覆盖 Plane 已有 assignee
- **`start_date` / `target_date`** → 写入 Work Item 起止日期；缺省可继承 milestone `plan_date`

## 环境变量（兜底）

```bash
export PLANE_ASSIGNEE_EMAIL=metacoo@wisilk.com   # 无 YAML owner 时
export PLANE_PUSH_ASSIGNEE=1                      # 允许写入 assignee
```

## plane/team-assignees.yaml（可选）

各 repo 可在 `plane/team-assignees.yaml` 覆盖或扩展映射：

```yaml
assignees:
  - name: 黄金芳
    github_email: 2283785225@qq.com
    plane_email: metacoo@wisilk.com
```

sync 优先读 repo 本地文件，再回退上表默认值。
