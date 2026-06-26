import { TreeSelect } from 'antd';
import type { TreeSelectProps } from 'antd';
import React from 'react';
import { useMarsunFetch } from '@/provider';
import { useFetchData } from '@/hooks/useFetchData';

export interface TreeNodeOption {
  value: string;
  title: React.ReactNode;
  key: string;
  children?: TreeNodeOption[];
  disabled?: boolean;
}

export type FetchTreeSelectProps = Omit<TreeSelectProps, 'treeData' | 'loading'> & {
  /** props 模式树数据（优先） */
  treeData?: TreeNodeOption[];
  /** fetch 模式 URL */
  fetchUrl?: string;
  fetchOptions?: RequestInit;
  /** 将 API 响应转为 treeData */
  transformData?: (raw: unknown) => TreeNodeOption[];
  enabled?: boolean;
};

/** 泛化树形选择：支持 props 或 fetch+transformData，无业务数据转换 */
const FetchTreeSelect: React.FC<FetchTreeSelectProps> = ({
  treeData: propsTreeData,
  fetchUrl,
  fetchOptions,
  transformData,
  enabled = true,
  ...rest
}) => {
  const fetchCtx = useMarsunFetch();
  const { data, loading } = useFetchData<TreeNodeOption[]>({
    data: propsTreeData,
    fetchUrl,
    fetchOptions,
    transformData,
    enabled,
    baseUrl: fetchCtx.baseUrl,
    defaultHeaders: fetchCtx.headers,
    timeoutMs: fetchCtx.timeoutMs,
  });

  return <TreeSelect treeData={data ?? []} loading={loading} {...rest} />;
};

export default FetchTreeSelect;
