# @hkyhy/marsun-components-core v0.1.77

- Table 内置分页拉数：`fetchData` / `fetchUrl`+`fetchOptions`/`transformData`、`fetchParams`、`enabled`、`TableFetchHandle.reload`
- 内部 `useTableFetch`（不从包根导出）；失败默认 emptyText，不在 core 弹 message
- Demo：`TableFetchDemo`；单测：`useTableFetch.test.ts`
