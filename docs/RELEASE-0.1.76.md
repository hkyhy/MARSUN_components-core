# @hkyhy/marsun-components-core v0.1.76

- `Table` / theme：\`cellPaddingInline\` / \`cellPaddingInlineMD\` 24→8，与上下 padding 对齐
- `Form` / \`SuperSelect\`：传入 \`api\` 时走远程加载，不再强制传 \`options\`（避免 kne 忽略 api）
- \`FormInfo\`：仅必填 label（\`is-req\`）保留 \`padding-left\`，非必填不再缩进
