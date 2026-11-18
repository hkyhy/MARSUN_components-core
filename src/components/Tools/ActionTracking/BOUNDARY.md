# ActionTracking 边界

| 本库保留                                                              | 业务 App 拥有                      |
| --------------------------------------------------------------------- | ---------------------------------- |
| `FormModal` / `FormInfo` / fields                                     | `CreateActionModal` + Form 字段面  |
| `ActionTrackingShell` / `ActionListTable` / `ActionFilterBar`         | `ActionFollowModal` 跟进/复核组合  |
| `isActionExecuteHidden` / `canQueryActionList` / `sanitizeActionHtml` | `CancelExecutionModal` / 认领 Form |

列定义、人员 loaders、维度码表、提交 REST 一律由 App 注入或实现。
