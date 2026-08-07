# OrgTree selection (SSO W4)

`OrgTree` supports controlled `selectedKeys` + `onSelect` for embedding panels (e.g. org-unit positions in `marsun_sso`).

**Consumers**

- Local monorepo: SSO Vite alias auto-picks sibling `dist` after `npm run build` here.
- Deployed SSO: bump published `@hkyhy/marsun-components-core` first; see `repos/marsun_sso/README.md` § OrgTree × components-core.
