# 代码格式化与 Lint

Marsun 团队仓库须安装统一的 Prettier + ESLint + Husky 工具链：前端子仓库（`repos/*`）与 **marsun_arch 元仓库** 根目录均适用，`.prettierrc` 规则对齐。

## 前端子仓库

所有 `repos/*` 下 Vite React 根目录须安装完整工具链（含 React ESLint 插件）。

**参考实现**（须保持对齐，升级时同步 bump）：

| 仓库                                   | 说明                                           |
| -------------------------------------- | ---------------------------------------------- |
| `repos/maoyang_data-asset-system`      | 业务项目                                       |
| `repos/marsun_components-core`         | npm 组件库（`format` glob 含 `dev/` showcase） |
| `repos/Agent_QualityAnalysis/frontend` | S3 质量分析看板                                |

## 必装 devDependencies

| 包                            | 用途                               |
| ----------------------------- | ---------------------------------- |
| `prettier`                    | 代码格式化                         |
| `eslint`                      | 静态检查                           |
| `@eslint/js`                  | ESLint 推荐规则                    |
| `typescript-eslint`           | TypeScript 规则                    |
| `eslint-config-prettier`      | 关闭与 Prettier 冲突的 ESLint 规则 |
| `eslint-plugin-prettier`      | 将 Prettier 作为 ESLint 规则运行   |
| `eslint-plugin-react-hooks`   | React Hooks 规则                   |
| `eslint-plugin-react-refresh` | Vite HMR 导出约束                  |
| `globals`                     | 浏览器全局变量                     |
| `lint-staged`                 | 提交前格式化                       |
| `husky`                       | Git pre-commit 钩子                |

版本对齐参考上述参考仓库的 `package.json`，升级时各仓库同步 bump。

## 必配根目录文件

### `.prettierrc`

与参考仓库保持一致（`semi`、`singleQuote`、`trailingComma: "all"`、`printWidth: 100` 等）。

### `eslint.config.js`

Flat config，覆盖 `**/*.{ts,tsx}`，集成 `prettier/prettier: warn` 与 `react-hooks` / `react-refresh` 推荐规则。

- 业务项目：复制 `maoyang_data-asset-system/eslint.config.js`（`ignores: ['dist']`）
- 组件库：同上，并追加 `dist-showcase` 到 `ignores`

### `.husky/pre-commit`

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint-staged -- --allow-empty
```

`chmod +x .husky/pre-commit`；`npm install` 时 `prepare` 脚本会生成 `.husky/_`。

**Git 根在父目录、前端在子目录**（如 `repos/Agent_QualityAnalysis/frontend`）：`.husky` 仍放在 `frontend/.husky/`，`prepare` 写为 `"cd .. && husky frontend/.husky"`；`pre-commit` 内先 `cd` 到 `frontend` 再跑 `npm run lint-staged -- --allow-empty`（可用 `cd "$(dirname -- "$0")/.."`）。

## package.json

### scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,scss,css,json}\"",
    "lint-staged": "lint-staged",
    "prepare": "husky"
  }
}
```

- **业务项目**：`format` glob 为 `src/**`（见上）
- **marsun_components-core**：`format` 为 `prettier --write \"{src,dev}/**/*.{ts,tsx,scss,css,json}\"`（showcase 在 `dev/`）

### lint-staged

```json
{
  "lint-staged": {
    "*.{js,ts,css,less,scss,vue,jsx,tsx,md,json}": ["prettier --write"]
  }
}
```

提交时仅对待暂存文件跑 Prettier；全量检查仍须手动 `npm run lint`。

## 使用约定

1. **提交前**：至少执行 `npm run lint`；有格式问题时运行 `npm run format` 或 `npm run lint:fix`。
2. **新建仓库**：从参考仓库复制 `.prettierrc`、`eslint.config.js`、`.husky/pre-commit` 与上述 `devDependencies` / `scripts` / `lint-staged`。
3. **husky**：`prepare` + `lint-staged` script + `.husky/pre-commit` 三件套齐全；`npm install` 后确认 `git config core.hooksPath` 指向 `.husky/_`。
4. **禁止**各仓库自建冲突的 Prettier 规则（如不同 `printWidth`），除非在团队规范中统一变更并同步所有仓库。

## 验收

```bash
npm install
npm run lint
npm run format
```

`lint` 无 error；`format` 后工作区无意外大规模 diff（说明配置已生效）。可选：暂存一个文件后 `git commit` 验证 pre-commit 触发 `lint-staged`。

---

## marsun_arch 元仓库

`marsun_arch` Git 根目录（`scripts/`、`plane/`、`docs/`、`.cursor/skills/`、`WorkRecord/` 等）同样须安装 Prettier + ESLint + Husky；**不装** `typescript-eslint` / React 相关 ESLint 插件。

| 项            | 说明                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| 权威实现      | marsun_arch 根目录 `package.json` + `.prettierrc` + `eslint.config.js`                                         |
| Prettier 范围 | `md` / `json` / `yaml` / `yml` / `mdc` / `mjs`；见 `.prettierignore`（排除 `repos/`、`.da/`、`node_modules/`） |
| ESLint 范围   | `scripts/**/*.mjs` 与根目录 `*.mjs`（Node `sourceType: module`）                                               |
| Husky         | 根目录 `.husky/pre-commit`；`npm install` 后执行 `da standards install-hooks` 链接 DA scan / Task 校验         |
| 保存时格式化  | `.vscode/settings.json`：`editor.formatOnSave` + Prettier 扩展；须先 `npm install`（本地 `prettier`）          |

### 必装 devDependencies（元仓库）

| 包                       | 用途                       |
| ------------------------ | -------------------------- |
| `prettier`               | 文档与脚本格式化           |
| `eslint`                 | `scripts/` 静态检查        |
| `@eslint/js`             | ESLint 推荐规则            |
| `eslint-config-prettier` | 关闭与 Prettier 冲突的规则 |
| `eslint-plugin-prettier` | Prettier 作为 ESLint 规则  |
| `globals`                | Node 全局变量              |
| `lint-staged`            | 提交前格式化               |
| `husky`                  | Git pre-commit 钩子        |

版本对齐 `repos/maoyang_data-asset-system` 同名包，升级时同步 bump。

### package.json（元仓库）

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "lint-staged": "lint-staged",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,mjs,md,json,yaml,yml,mdc}": ["prettier --write"],
    "scripts/**/*.mjs": ["eslint --fix"]
  }
}
```

`.prettierrc` 与前端子仓库一致；`.prettierignore` 须排除 `repos/`（本地 clone 不进格式化范围）。

### `.vscode/settings.json`（保存时格式化）

`npm run format` / Husky **不会在保存时触发**；须在仓库根配置编辑器：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.prettierPath": "./node_modules/prettier",
  "prettier.requireConfig": true
}
```

并安装扩展 **Prettier - Code formatter**（`esbenp.prettier-vscode`）。Cursor 打开仓库后若提示安装推荐扩展，点安装即可。

### 验收（元仓库）

```bash
npm install
da standards install-hooks
npm run lint
npm run format
```

`lint` 无 error；`format` 后仅预期文件有 diff。提交时 pre-commit 跑 `lint-staged`，DA hooks 负责 `da standards scan` 与 `Task:` 校验。
