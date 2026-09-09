# @hkyhy/marsun-components-core v0.1.78

- FormInfo：`Form.tsx` 显式引入 `@kne/react-form-antd/dist/index.css`（库构建并入 `styles/global.css`），避免业务生产 tree-shake 丢掉必填星号与 inner 字段行距
- FormInfo label：`.is-req` / `.marsun-form-info-is-req` 自带 `content: '*'`
- Showcase：补交 Table Fetch 演示到 `examples-registry`
