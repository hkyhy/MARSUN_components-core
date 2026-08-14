import { Popover } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import { useFilterLayout } from '../FilterLayoutContext';
import FilterPanel from '../FilterPanel';
import FilterTrigger from '../FilterTrigger';
import styles from './style.module.scss';

interface FilterPopoverProps {
  /** 筛选项标签 */
  label: string;
  /** 是否有值（控制选中态样式） */
  active?: boolean;
  /** 选项加载中：透传至 FilterTrigger */
  loading?: boolean;
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
  loading = false,
  width,
  confirmText = '确定',
  children,
  open: controlledOpen,
  onOpenChange,
  onConfirm,
  onReset,
}) => {
  const { isMobile } = useFilterLayout();
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

  const panelWidth = isMobile ? undefined : width || 300;

  return (
    <>
      {isMobile && open && (
        <div
          className={classNames('filter-popover-mask', styles['filter-popover-mask'])}
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger="click"
        placement={isMobile ? 'bottom' : 'bottomLeft'}
        destroyOnHidden
        arrow={!isMobile}
        classNames={{
          root: classNames(
            'filter-popover-panel',
            isMobile && ['filter-popover-panel-mobile', styles['filter-popover-panel-mobile']],
          ),
        }}
        styles={{
          content: isMobile
            ? {
                boxSizing: 'border-box',
                width: 'min(100vw, 100%)',
                maxWidth: '100vw',
                maxHeight: 'min(70vh, 520px)',
                padding: 12,
                overflow: 'auto',
              }
            : { maxWidth: panelWidth, padding: 0 },
        }}
        getPopupContainer={() => document.body}
        content={
          <FilterPanel
            onConfirm={onConfirm ? handleConfirm : undefined}
            onReset={onReset ? handleReset : undefined}
            confirmText={confirmText}
            width={isMobile ? undefined : width || 300}
            mobile={isMobile}
          >
            {children}
          </FilterPanel>
        }
      >
        <span style={{ display: 'inline-flex' }}>
          <FilterTrigger
            label={label}
            active={active}
            open={open}
            loading={loading}
            pill={isMobile}
          />
        </span>
      </Popover>
    </>
  );
};

export default FilterPopover;
export type { FilterPopoverProps };
