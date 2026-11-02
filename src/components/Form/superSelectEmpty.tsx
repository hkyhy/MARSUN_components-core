import { Empty, Spin } from 'antd';
import type { ReactNode } from 'react';

/** kne SuperSelect / Filter 空列表文案（禁组件默认英文空态） */
export const SUPER_SELECT_EMPTY_TEXT = '暂无数据';

/** kne `empty` 默认节点；调用方可覆盖 */
export function defaultSuperSelectEmpty(): ReactNode {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={SUPER_SELECT_EMPTY_TEXT} />;
}

/**
 * kne FetchScrollLoader / react-fetch 首包 loading。
 * @kne/react-fetch 全局默认 loading=null，不传则下拉空白无反馈。
 */
export function defaultSuperSelectLoading(): ReactNode {
  return (
    <div
      className="marsun-super-select-loading"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '28px 0',
        color: 'rgba(0,0,0,0.45)',
        fontSize: 12,
      }}
    >
      <Spin size="small" />
      <span>加载中…</span>
    </div>
  );
}
