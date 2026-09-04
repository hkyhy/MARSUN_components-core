import { Alert } from '@/components/Alert';
import { ModulePageShell } from '@/components/Layout';
import { OrgTree, type OrgTreeNode } from '@/components/OrgTree';
import { message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import type { IamClient } from '../client';
import type { IamOrgUnit } from '../types';

function toNodes(nodes: IamOrgUnit[]): OrgTreeNode[] {
  return nodes.map((n) => ({
    id: n.id,
    name: n.name,
    parentId: n.parentId ?? null,
    children: n.children?.length ? toNodes(n.children) : undefined,
  }));
}

export type IamOrgPageProps = {
  client: IamClient;
  /** SSO Admin 组织维护页 URL（由 App 用 AUTH_LOGIN_URL 推导） */
  ssoOrgAdminUrl: string;
  title?: string;
};

export default function IamOrgPage({
  client,
  ssoOrgAdminUrl,
  title = '组织架构管理',
}: IamOrgPageProps) {
  const [loading, setLoading] = useState(false);
  const [tree, setTree] = useState<IamOrgUnit[]>([]);

  useEffect(() => {
    setLoading(true);
    void client
      .listOrgUnits()
      .then(setTree)
      .catch((e) => message.error(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setLoading(false));
  }, [client]);

  const nodes = useMemo(() => toNodes(tree), [tree]);

  return (
    <ModulePageShell title={title}>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="组织架构请在 SSO 维护"
        description={
          <a href={ssoOrgAdminUrl} target="_blank" rel="noreferrer">
            打开 SSO 组织
          </a>
        }
      />
      <OrgTree nodes={nodes} loading={loading} editable={false} />
    </ModulePageShell>
  );
}
