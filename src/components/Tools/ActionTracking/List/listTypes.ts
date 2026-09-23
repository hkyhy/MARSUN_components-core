import type { ReactNode } from 'react';
import type { ColumnsType } from 'antd/es/table';

/** 行动列表筛选（App 可扩展字段；core 认 created 窗作 canQuery） */
export type ActionListFilters = {
  dimension?: string;
  status?: string;
  assignee?: string;
  factory?: string;
  q?: string;
  from?: string;
  to?: string;
  startedFrom?: string;
  startedTo?: string;
  completedFrom?: string;
  completedTo?: string;
};

/** 列表行最小字段（列 render 由 App 注入） */
export type ActionListRowBase = {
  id: string;
  title?: string;
  status?: string;
  dimension?: string;
  assignee?: string;
  owner?: string;
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelReason?: string;
  factory?: string;
  factoryCode?: string;
  factoryName?: string;
  variety?: string;
  materialName?: string;
  machine?: string;
  machineName?: string;
  metric?: string;
  metricCode?: string;
  metricName?: string;
  verifyMetric?: string;
};

export type ActionListSelectOption = {
  value: string;
  label: string;
};

export type ActionListColumns<T extends ActionListRowBase = ActionListRowBase> =
  ColumnsType<T> | readonly unknown[];

export type ActionListEmptyConfig = {
  icon?: ReactNode;
  text?: ReactNode;
};
