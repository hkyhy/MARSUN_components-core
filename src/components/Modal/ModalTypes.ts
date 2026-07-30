import type { ReactNode } from 'react';
import type { DescriptionItem } from '../Descriptions/CommonDescriptions';
import type { ModalSize } from './utils/resolveModalSize';

export type MarsunModalProps = {
  open: boolean;
  onCancel: () => void;
  /** 弹窗标题（必填） */
  title: ReactNode;
  /** 标题旁 Info + TooltipInfo（对齐 InteractiveBlock） */
  info?: DescriptionItem[];
  /** 标题行下方说明文案 */
  description?: ReactNode;
  /** 标题右侧操作，ButtonGroup listArray */
  actions?: Record<string, unknown>[];
  footer?: ReactNode | null;
  size?: ModalSize;
  /** 显式默认宽，优先于 size 作为锚点 */
  width?: number;
  children: ReactNode;
  className?: string;
  destroyOnHidden?: boolean;
  maskClosable?: boolean;
  /** body 内单层 VirtualScrollbar */
  scrollable?: boolean;
  closable?: boolean;
};
