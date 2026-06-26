import { Select } from 'antd';
import type { SelectProps } from 'antd';
import React from 'react';
import { useMarsunFetch } from '@/provider';
import { useFetchData } from '@/hooks/useFetchData';

export interface SelectOptionItem {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
  [key: string]: unknown;
}

export type FetchSelectProps = Omit<
  SelectProps,
  'options' | 'loading' | 'filterOption' | 'optionLabelProp'
> & {
  /** props 模式选项（优先） */
  options?: SelectOptionItem[];
  fetchUrl?: string;
  fetchOptions?: RequestInit;
  transformData?: (raw: unknown) => SelectOptionItem[];
  enabled?: boolean;
  /** 自定义选项行渲染 */
  optionRender?: (option: SelectOptionItem) => React.ReactNode;
};

/** 泛化下拉选择：支持 props 或 fetch+transformData */
const FetchSelect: React.FC<FetchSelectProps> = ({
  options: propsOptions,
  fetchUrl,
  fetchOptions,
  transformData,
  enabled = true,
  optionRender,
  ...rest
}) => {
  const fetchCtx = useMarsunFetch();
  const { data, loading } = useFetchData<SelectOptionItem[]>({
    data: propsOptions,
    fetchUrl,
    fetchOptions,
    transformData,
    enabled,
    baseUrl: fetchCtx.baseUrl,
    defaultHeaders: fetchCtx.headers,
    timeoutMs: fetchCtx.timeoutMs,
  });

  return (
    <Select
      options={data}
      loading={loading}
      optionRender={
        optionRender
          ? (ori) => optionRender(ori.data as SelectOptionItem)
          : undefined
      }
      {...rest}
    />
  );
};

export default FetchSelect;
