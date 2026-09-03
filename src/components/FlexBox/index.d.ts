import type { ListProps } from 'antd';
import type { CSSProperties, ReactNode, Ref } from 'react';

export type FlexBoxColumn = {
  width: number;
  col: number;
  size?: number;
};

export type UseFlexBoxOptions = {
  columns?: FlexBoxColumn[];
  onChange?: (column: FlexBoxColumn) => void;
};

export type UseFlexBoxResult = {
  ref: Ref<HTMLElement>;
  column: FlexBoxColumn | null;
};

export declare function useFlexBox(props?: UseFlexBoxOptions): UseFlexBoxResult;

export declare const defaultColumns: FlexBoxColumn[];

export type FlexBoxProps<T = any> = {
  columns?: FlexBoxColumn[];
  outerClassName?: string;
  className?: string;
  gutter?: number | [number, number];
  dataSource?: T[];
  renderItem?: (item: T, index: number) => ReactNode;
  rowKey?: string | ((item: T) => string | number);
  onChange?: (column: FlexBoxColumn) => void;
  children?: ReactNode;
};

declare const FlexBox: (<T = any>(props: FlexBoxProps<T>) => ReactNode) & {
  Item: (props: { className?: string; style?: CSSProperties; children?: ReactNode }) => ReactNode;
};

export default FlexBox;
export { FlexBox };

export type FlexBoxFetchProps<T = any> = FlexBoxProps<T> & {
  api?: Record<string, unknown>;
  getFetchApi?: (column: FlexBoxColumn) => Record<string, unknown>;
  dataFormat?: (data: any) => T[];
  pagination?: boolean | Record<string, unknown>;
};

declare const FlexBoxFetch: (<T = any>(
  props: FlexBoxFetchProps<T> & { ref?: Ref<unknown> },
) => ReactNode) & {
  Item: typeof FlexBox.Item;
};

export { FlexBoxFetch };

export declare const FlexBoxView: (props: {
  column: FlexBoxColumn;
  gutter?: number | [number, number];
  className?: string;
  dataSource?: unknown[];
  renderItem?: (item: unknown, index: number) => ReactNode;
  rowKey?: string | ((item: unknown) => string | number);
  children?: ReactNode;
}) => ReactNode;

export declare const FlexBoxViewItem: (props: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) => ReactNode;

export declare function getItemKey(
  rowKey: string | ((item: unknown) => string | number) | undefined,
  item: unknown,
  index: number,
): string | number;

export type { ListProps };
