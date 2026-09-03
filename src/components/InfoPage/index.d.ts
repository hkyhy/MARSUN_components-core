/* Ported from https://github.com/kne-union/info-page/blob/master/src/index.d.ts */
import { ReactNode, ComponentType, FC } from 'react';
import { StepsProps } from 'antd';

// 基础类型定义
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  [key: string]: any;
}

// InfoPage 组件类型
export interface InfoPageProps extends BaseComponentProps {
  // InfoPage 特有属性可在此添加
}

export interface InfoPagePartProps extends BaseComponentProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  bordered?: boolean;
}

// Content 组件类型
export interface ContentItem {
  label?: ReactNode;
  content?: ReactNode;
  block?: boolean;
  display?: boolean | ((item: ContentItem, list: ContentItem[]) => boolean);
}

export interface ContentProps extends BaseComponentProps {
  list?: ContentItem[];
  labelAlign?: 'left' | 'right' | 'auto';
  col?: number;
  gutter?: number;
  size?: 'small';
  itemRender?: (component: ReactNode, item: ContentItem & { index: number }) => ReactNode;
}

// Descriptions 组件类型
export interface DescriptionsItem {
  label: ReactNode;
  content: ReactNode;
}

export interface DescriptionsProps extends BaseComponentProps {
  dataSource: DescriptionsItem[][];
  isFull?: boolean;
  itemRender?: (component: ReactNode, item: DescriptionsItem & { index: number }) => ReactNode;
}

// CentralContent 组件类型
export interface ColumnDefinition {
  name: string;
  title?: ReactNode;
  format?: string | ((value: any, context: any) => ReactNode);
  render?: (value: any, context: any) => ReactNode;
  span?: number;
  getValueOf?: (dataSource: any, context: any) => any;
  display?: boolean | ((value: any, context: any) => boolean);
  valueIsEmpty?: (value: any) => boolean;
  emptyIsPlaceholder?: boolean;
  placeholder?: ReactNode;
  renderPlaceholder?: (context: any) => ReactNode;
}

export interface CentralContentProps extends BaseComponentProps {
  dataSource?: object;
  columns?: ColumnDefinition[];
  col?: number;
  valueIsEmpty?: (value: any) => boolean;
  emptyIsPlaceholder?: boolean;
  placeholder?: ReactNode;
  context?: object;
  /** label 最大宽度；设置后超出该宽度允许换行。数字按 px 处理 */
  labelMaxWidth?: number | string;
  /** label 最小宽度，默认 100 */
  labelMinWidth?: number | string;
  /** content 最小宽度，默认 100 */
  contentMinWidth?: number | string;
}

// TableView 组件类型
export interface RowSelectionConfig {
  type?: 'checkbox' | 'radio';
  selectedRowKeys?: any[];
  onChange?: (
    selectedRowKeys: any[],
    selectedRow: any,
    context: { context?: any; checked?: boolean },
  ) => void;
  isSelectedAll?: boolean;
}

export interface TableViewProps extends BaseComponentProps {
  dataSource?: any[];
  columns?: ColumnDefinition[];
  rowKey?: string | ((record: any) => any);
  rowSelection?: RowSelectionConfig;
  valueIsEmpty?: (value: any) => boolean;
  emptyIsPlaceholder?: boolean;
  placeholder?: ReactNode;
  empty?: ReactNode;
  onRowSelect?: (
    record: any,
    context: { columns?: ColumnDefinition[]; dataSource?: any[] },
  ) => void;
  render?: (props: {
    header: ReactNode;
    renderBody: (dataSource: any[], context: any) => ReactNode;
  }) => ReactNode;
  context?: object;
  sticky?: boolean;
}

// Flow 组件类型
export interface FlowActionListItem {
  name?: ReactNode;
  action?: ReactNode;
  options?: ReactNode;
  content?: ReactNode;
}

export interface FlowColumnsMap {
  [key: string]: ColumnDefinition & {
    children?: Map<string, ColumnDefinition>;
  };
}

export interface FlowProps extends BaseComponentProps {
  dataSource?: any[];
  columns?: ColumnDefinition[];
  size?: 'small' | 'default';
  empty?: ReactNode;
  valueIsEmpty?: (value: any) => boolean;
  placeholder?: ReactNode;
  emptyIsPlaceholder?: boolean;
  progressDot?: boolean;
  labelPlacement?: 'horizontal' | 'vertical';
  direction?: 'horizontal' | 'vertical';
}

// SplitLine 组件类型
export interface SplitLineProps extends BaseComponentProps {
  dataSource?: object;
  columns?: ColumnDefinition[];
  valueIsEmpty?: (value: any) => boolean;
  placeholder?: ReactNode;
  emptyIsPlaceholder?: boolean;
  size?: number;
  labelGap?: number;
  labelMode?: 'horizontal' | 'vertical';
  split?: ReactNode;
  context?: object;
}

// Report 组件类型
export interface ReportProps extends BaseComponentProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  border?: boolean;
  primaryColor?: string;
  primaryColor1?: string;
}

// Score 组件类型
export interface ScoreProps extends BaseComponentProps {
  value: number;
  gap?: number;
  total?: number;
}

// formatView 函数类型
export interface FormatContext {
  dataSource?: any;
  column?: ColumnDefinition;
  target?: any;
  [key: string]: any;
}

export type FormatFunction = (value: any, context: FormatContext) => ReactNode;

export declare const defaultFormat: {
  date: FormatFunction;
  datetime: FormatFunction;
  dateRange: FormatFunction;
  boolean: FormatFunction;
  number: FormatFunction;
  money: FormatFunction;
};

export declare const formatView: (value: any, format: string, context?: FormatContext) => ReactNode;

// computeColumnsValue 函数类型
export interface ComputeColumnsValueConfig {
  columns: ColumnDefinition[];
  dataSource: object | any[];
  context?: object;
  valueIsEmpty?: (value: any) => boolean;
  emptyIsPlaceholder?: boolean;
  removeEmpty?: boolean;
  placeholder?: ReactNode;
}

export interface ComputeDisplayConfig {
  column: ColumnDefinition;
  dataSource?: object;
  placeholder?: ReactNode;
  context?: object;
}

export declare const computeColumnsValue: {
  (config: ComputeColumnsValueConfig): (ColumnDefinition & { isEmpty?: boolean; value?: any })[];
  computeDisplay: (config: ComputeDisplayConfig) => ReactNode;
  computeColumnsDisplay: (config: ComputeColumnsValueConfig) => ReactNode[];
};

// 组件声明
export declare const InfoPage: FC<InfoPageProps> & {
  Part: FC<InfoPagePartProps>;
  Collapse: ComponentType<any>;
};

export declare const Content: FC<ContentProps> & {
  Label: FC<{ className?: string; children: ReactNode; setWidth: (width: number) => void }>;
};

export declare const Descriptions: FC<DescriptionsProps>;

export declare const CentralContent: FC<CentralContentProps>;

export declare const TableView: FC<TableViewProps> & {
  Header: ComponentType<any>;
};

export declare const Flow: FC<FlowProps> & {
  ActionList: FC<FlowActionListItem>;
};

export declare const SplitLine: FC<SplitLineProps>;

export declare const Report: FC<ReportProps> & {
  List: ComponentType<any>;
  Result: ComponentType<any>;
  Table: ComponentType<any>;
  Part: ComponentType<any>;
  Score: FC<ScoreProps>;
  PrintPageBreak: ComponentType<any>;
};

export declare const Score: FC<ScoreProps>;

export declare const InfoList: typeof Content;
export declare const DetailList: typeof Descriptions;
export declare const FieldView: typeof CentralContent;
export declare function formatView(...args: any[]): any;
export declare const defaultFormat: any;
export declare function computeDisplay(...args: any[]): any;
export declare function computeColumnsDisplay(...args: any[]): any;

// 默认导出
export default InfoPage;
