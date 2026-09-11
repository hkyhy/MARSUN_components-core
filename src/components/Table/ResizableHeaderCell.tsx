import classNames from 'classnames';
import {
  useRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type ThHTMLAttributes,
} from 'react';
import {
  clampColumnWidth,
  COLUMN_RESIZE_MAX_WIDTH,
  COLUMN_RESIZE_MIN_WIDTH,
} from './columnConfigUtils';
import styles from './style.module.scss';

export type ResizableHeaderCellProps = ThHTMLAttributes<HTMLTableCellElement> & {
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  /** 开始拖拽前调用（用于锁死其它列宽） */
  onResizeStart?: () => void;
  onResize?: (width: number) => void;
  onResizeStop?: (width: number) => void;
  /** 双击把手：清除自定义 width */
  onReset?: () => void;
  children?: ReactNode;
};

/**
 * antd Table header.cell：表头右缘拖拽调宽；无 onResize 时退化为普通 th。
 */
export default function ResizableHeaderCell({
  width,
  minWidth = COLUMN_RESIZE_MIN_WIDTH,
  maxWidth = COLUMN_RESIZE_MAX_WIDTH,
  onResizeStart,
  onResize,
  onResizeStop,
  onReset,
  children,
  className,
  style,
  ...rest
}: ResizableHeaderCellProps) {
  const thRef = useRef<HTMLTableCellElement>(null);
  const lastWidthRef = useRef<number | undefined>(
    typeof width === 'number' && Number.isFinite(width) ? width : undefined,
  );

  if (!onResize) {
    return (
      <th {...rest} className={className} style={style} ref={thRef}>
        {children}
      </th>
    );
  }

  const startDrag = (e: ReactMouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // 先锁兄弟列，再量本列（锁宽可能触发重排，故本列尽量用当前 offsetWidth）
    onResizeStart?.();
    const measured =
      thRef.current?.offsetWidth ||
      (typeof width === 'number' && Number.isFinite(width) && width > 0 ? width : minWidth);
    const startX = e.clientX;
    const startW = measured;
    lastWidthRef.current = startW;

    const onMove = (ev: MouseEvent) => {
      const next = clampColumnWidth(startW + (ev.clientX - startX), minWidth, maxWidth);
      lastWidthRef.current = next;
      onResize(next);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      const finalW = lastWidthRef.current;
      if (typeof finalW === 'number') onResizeStop?.(finalW);
    };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  // 勿覆盖已有 sticky（固定列表头）；无 position 时才补 relative 给把手定位
  const mergedStyle = {
    ...style,
    position: style?.position ?? 'relative',
    overflow: style?.overflow ?? 'visible',
  };

  return (
    <th
      {...rest}
      ref={thRef}
      className={classNames(className, styles.resizableHeaderCell)}
      style={mergedStyle}
    >
      {children}
      <span
        role="separator"
        aria-orientation="vertical"
        aria-label="拖拽调整列宽，双击重置"
        title="拖拽调宽 · 双击重置"
        className={styles.resizeHandle}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={startDrag}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onReset?.();
        }}
      />
    </th>
  );
}
