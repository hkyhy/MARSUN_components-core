# FOCUS 对比矩阵：前端投影（与后端解耦）

适用：质量分析沙盘 `PlantMetricMatrix` + `POST .../focus-metric-matrix`。  
后端边界 SSOT：[backend-dev-spec · focus-matrix-前后端边界.md](../../../backend-dev-spec/references/focus-matrix-前后端边界.md)。

## 前端只做这些

| 事项         | 落点                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| 三级表头列树 | **优先**响应 `data.headerTree`；缺省回落 `FOCUS_METRIC_GROUPS`（leafId ASCII） |
| 表头可见文案 | `leaf.metricName`；**禁止**用 `sapCode` / `metricList.metricCode` 当列标题     |
| 列偏好键     | `columnKey = leafId`；`tableName`：`qa_sandbox_plant_metric_matrix_v3`         |
| 取数         | `sapCode` → `cells[sap]`；`sapCode==null` →「未接入」                          |
| 工艺列       | `leafId === sapCode`（ADS 列名）；`metricName`=Comment 中文                    |

## 前端禁止

- 要求接口按 FOCUS 叶灌测值（测值键仍是 Doris）
- 中文叶码 / `_2` 后缀当列身份（已废除）
- 把细节/粗节硬映成 `TGCV`
- 叶过滤后留下空 `children: []`

## `sapCode: null` 与「未接入」

表头照常画；无机器码不取数。有 `sapCode` 仍「未接入」→ 查 `metricList` 是否带回该码与 `actualValue`。

## 与湖仓 `metric-matrix` 的关系

- 沙盘：`focus-metric-matrix`
- 湖仓权威：`metric-matrix`（勿用 FOCUS leafId 校验）
