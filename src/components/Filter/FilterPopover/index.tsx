import { Popover } from 'antd';
import React, { useState } from 'react';
import FilterPanel from '../FilterPanel';
import FilterTrigger from '../FilterTrigger';

interface FilterPopoverProps {
  /** 筛选项标签 */
  label: string;
  /** 是否有值（控制选中态样式） */
  active?: boolean;
  /** 面板宽度 */
  width?: number;
  /** 确定按钮文字 */
  confirmText?: string;
  /** 面板内容 */
  children: React.ReactNode;
  /** 受控打开状态（传入则由外部控制） */
  open?: boolean;
  /** 打开状态变更回调 */
  onOpenChange?: (open: boolean) => void;
  /** 确认回调（不传则无确定/取消按钮）；返回 `false` 时不关闭弹层 */
  onConfirm?: () => void | boolean;
  /** 取消回调 */
  onReset?: () => void;
}

const FilterPopover: React.FC<FilterPopoverProps> = ({
  label,
  active,
  width,
  confirmText = '确定',
  children,
  open: controlledOpen,
  onOpenChange,
  onConfirm,
  onReset,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  const setOpen = (value: boolean) => {
    setInternalOpen(value);
    onOpenChange?.(value);
  };

  const handleConfirm = () => {
    const result = onConfirm?.();
    if (result === false) return;
    setOpen(false);
  };

  const handleReset = () => {
    onReset?.();
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomLeft"
      destroyOnHidden
      classNames={{ root: 'filter-popover-panel' }}
      styles={{ content: { maxWidth: width || 300, padding: 0 } }}
      getPopupContainer={() => document.body}
      content={
        <FilterPanel
          onConfirm={onConfirm ? handleConfirm : undefined}
          onReset={onReset ? handleReset : undefined}
          confirmText={confirmText}
          width={width || 300}
        >
          {children}
        </FilterPanel>
      }
    >
      <span style={{ display: 'inline-flex' }}>
        <FilterTrigger label={label} active={active} open={open} />
      </span>
    </Popover>
  );
};

export default FilterPopover;
export type { FilterPopoverProps };
