# FOCUS 对比矩阵：前端投影（与后端解耦）

适用：质量分析沙盘 `PlantMetricMatrix` + `POST .../focus-metric-matrix`。  
后端边界 SSOT：[backend-dev-spec · focus-matrix-前后端边界.md](../../../backend-dev-spec/references/focus-matrix-前后端边界.md)。

## 前端只做这些

| 事项         | 落点                                                                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 三级表头列树 | **优先**响应 `data.headerTree`；缺省回落 `FOCUS_METRIC_GROUPS`（leafId ASCII）                                                                                                                 |
| 表头可见文案 | `leaf.metricName`；列 `title` **必须是 string**（列配置面板遇 ReactNode 会显示 key）；禁止 sapCode 当标题；**禁止**把 `display:block` 样式挂到 Column.className（会打穿 table-cell，表头竖排） |
| 固定列 hover | 分厂/品种 `title`=展示名；**禁止** `title={factoryCode\|varietyCode}`                                                                                                                          |
| 列偏好键     | `columnKey = leafId`（勿再拼 `groupId_indicatorId_leafId`）；`tableName`：`qa_sandbox_plant_metric_matrix_v3`                                                                                  |
| 取数         | `sapCode` → `cells[sap]`；`sapCode==null` →「未接入」                                                                                                                                          |
| 工艺列       | `leafId === sapCode`（ADS 列名）；`metricName`=Comment 中文                                                                                                                                    |
| 配料列       | `sapCode`=棉/纤字段（`micronaire`/`avgLengthMm`…）；与成品相同按 `cells[sap]` 取数；勿期待 `cottonList`                                                                                        |

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
