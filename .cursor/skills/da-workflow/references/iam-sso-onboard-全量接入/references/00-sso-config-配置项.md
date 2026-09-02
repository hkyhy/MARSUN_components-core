# SSO 配置项参考

> 本文件 = SSO 与业务两侧配置对照。
> **平台级配置走 SSO Admin `/admin/settings` 平台配置 Tab（热生效，≤30s 缓存）**，`.env` 仅首次启动兜底。
> **密钥类留 `.env`，禁止页面改**。secret 用占位符，勿提交。

## SSO 平台配置页（热生效；仅 PLATFORM_ADMIN 可见）

改后即时热生效：`updatePlatformConfig` 写 DB 后调 `invalidatePlatformConfigCache()`（清 service 层 30s 缓存）+ `clearPlatformConfigSnapshot()` + `await refreshPlatformConfigSnapshot()`（清并即时重建 config.ts 快照），getter 立即读到新值，无 30s 延迟窗口。逗号分隔字段服务端自动 split+trim+dedupe。

| 配置                       | 控件               | 说明                     | 改后影响                   |
| -------------------------- | ------------------ | ------------------------ | -------------------------- |
| `CORS_ORIGINS`             | textarea 逗号分隔  | 允许携带 Cookie 的前端源 | 新源立即带 Cookie          |
| `ALLOWED_REDIRECT_ORIGINS` | textarea 逗号分隔  | 允许的 redirect_url 源   | 新回跳源立即放行           |
| `DEFAULT_POST_LOGIN_URL`   | Input              | 登录后默认回跳           | 立即生效                   |
| `SESSION_COOKIE_NAME`      | Input              | Cookie 名                | 已登录用户需重登           |
| `SESSION_COOKIE_DOMAIN`    | Input              | Cookie domain            | 已登录用户需重登           |
| `SESSION_COOKIE_SECURE`    | Switch（二次确认） | prod 建议 true           | 已登录用户需重登           |
| `SESSION_COOKIE_SAME_SITE` | Input              | lax/strict/none          | 已登录用户需重登           |
| `TENANT_ID_STRICT`         | Switch（二次确认） | prod 强烈建议 true       | 缺 tenantId token 立即 401 |
| `JWT_EXPIRES_IN`           | Input              | 如 `7d`                  | 下次签发生效               |
| `JWT_EMIT_ROLE_HINTS`      | Switch             | 默认 false               | 下次签发生效               |
| `OIDC_LOCAL_LOGIN_ENABLED` | Switch             | 本地工号密码灾备登录     | 立即生效                   |
| `BCRYPT_ROUNDS`            | InputNumber        | 密码哈希 rounds          | 下次注册/改密生效          |

## 仍留 .env（密钥/基础设施，禁页面改，改后须重启）

| 配置                                                                                                           | 说明                                                 |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `JWT_SECRET`                                                                                                   | 全平台 JWT 签发密钥；各业务后端须一致；**永不进 DB** |
| `DATABASE_URL`                                                                                                 | SSO 数据库连接                                       |
| `MAOYANG_DATABASE_URL`                                                                                         | 一次性迁移用                                         |
| `OIDC_ISSUER` / `OIDC_CLIENT_ID` / `OIDC_CLIENT_SECRET` / `OIDC_REDIRECT_URI` / `OIDC_SCOPES` / `OIDC_CLAIM_*` | 企业 IdP 配置                                        |
| `PORT` / `NODE_ENV` / `CLIENT_URL` / `ASSETS_API_BASE_URL` / `MOBILE_*`                                        | 基础设施                                             |

## 业务后端配置（留 .env）

| 配置                                   | 说明                                            |
| -------------------------------------- | ----------------------------------------------- |
| `JWT_SECRET`                           | 与 SSO 一致；不一致 → 401                       |
| `SESSION_COOKIE_NAME`                  | 同 SSO（`marsun_session`）                      |
| `SSO_API_BASE_URL`                     | EP 调用地址（如 `http://localhost:8090`）       |
| `IAM_AUTHZ_MODE` / `S3_IAM_AUTHZ_MODE` | 各 App **独立** env；默认 dual；非 DEMO 禁 off  |
| `TENANT_ID_STRICT`                     | 生产 true                                       |
| `AUTH_REQUIRED`                        | 无 JWT_SECRET 时本地演示；生产必须配真实 secret |

## 业务前端配置（留 .env，Vite 构建期注入）

| 配置                        | 说明                                           |
| --------------------------- | ---------------------------------------------- |
| `VITE_AUTH_LOGIN_URL`       | 中心登录页（如 `http://localhost:3100/login`） |
| `VITE_AUTH_BASE_URL`        | session/EP 基址（跨域时填）                    |
| `VITE_AUTH_TENANT_CODE`     | 拼到 `?tenant=`（如 `HUAMAO`）                 |
| `VITE_AUTH_ALLOWED_ORIGINS` | 允许回跳源                                     |
| `VITE_SSO_ENABLED`          | 灾备：false 时恢复本系统工号密码登录           |
| `VITE_IAM_AUTHZ_MODE`       | 前端镜像 BE 模式                               |

## dev 兜底示例（首次启动；之后以平台配置页为准）

```bash
# server/.env（首次启动兜底；改 CORS 等请走 /admin/settings 平台配置 Tab）
PORT=8090
NODE_ENV=development
CLIENT_URL=http://localhost:3100
CORS_ORIGINS=http://localhost:3100,http://localhost:3000,http://localhost:5173
JWT_SECRET=<填真实 secret>
JWT_EXPIRES_IN=7d
SESSION_COOKIE_NAME=marsun_session
TENANT_ID_STRICT=false
DEFAULT_POST_LOGIN_URL=http://localhost:3000/dashboard
ALLOWED_REDIRECT_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:3100
DATABASE_URL=<填>
```

## prod 兜底示例（首次部署；之后改平台配置页，.env 仅留密钥类）

```bash
# server/.env.production（首次部署兜底；CORS/Redirect 等改走 /admin/settings 平台配置 Tab）
PORT=18090
NODE_ENV=production
CLIENT_URL=http://192.168.10.239:5181
CORS_ORIGINS=http://192.168.10.239:5181,http://192.168.10.239:5081,http://192.168.10.239
JWT_SECRET=<填真实 secret>
JWT_EXPIRES_IN=7d
SESSION_COOKIE_NAME=marsun_session
SESSION_COOKIE_SECURE=true
TENANT_ID_STRICT=true
DEFAULT_POST_LOGIN_URL=http://192.168.10.239:5081/
ALLOWED_REDIRECT_ORIGINS=http://192.168.10.239:5181,http://192.168.10.239:5081,http://192.168.10.239
DATABASE_URL=<填>
```

## 常见坑

1. **JWT_SECRET 不一致 → 401**：各业务后端必须与 SSO 同一 secret；且本页不可改（须改 .env + 重启）。
2. **忘加业务源到平台配置页 CORS_ORIGINS → Cookie 不带**：浏览器跨域不带 Cookie，CORS 校验在 SSO 侧。
3. **忘加回跳源到平台配置页 ALLOWED_REDIRECT_ORIGINS → 登录后报错**：redirect_url 校验在 SSO 侧。
4. **prod 未在平台配置页开 TENANT_ID_STRICT → 串租户**：缺 tenantId 的 token 放行，违反 `05-tenant-isolation`。
5. **平台配置改了但读旧值**：写后已自动 `invalidatePlatformConfigCache` + `clearPlatformConfigSnapshot` + `await refreshPlatformConfigSnapshot`（即时生效，无 30s 窗口）；若仍读旧值，检查 `updatePlatformConfig` 是否漏调这三步。
6. _*改 SESSION_COOKIE_* 后用户未重登_*：Cookie 名/domain/secure/sameSite 变更致旧 Cookie 失效，页面会提示「已登录用户需重新登录」。
