import { Empty } from 'antd';
import type { ReactNode } from 'react';

/** kne SuperSelect / Filter 空列表文案（禁组件默认英文空态） */
export const SUPER_SELECT_EMPTY_TEXT = '暂无数据';

/** kne `empty` 默认节点；调用方可覆盖 */
export function defaultSuperSelectEmpty(): ReactNode {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={SUPER_SELECT_EMPTY_TEXT} />;
}
