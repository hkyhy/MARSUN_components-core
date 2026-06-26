import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useVirtualScrollbar, type ScrollDirection } from '../useVirtualScrollbar';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface VirtualScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** 滚动方向，默认 vertical */
  direction?: ScrollDirection;
  /** 滚动/悬停后自动隐藏 thumb，默认 true */
  autoHide?: boolean;
  /** 外层容器 className */
  wrapperClassName?: string;
}

/** 覆盖式虚拟滚动条：隐藏原生滚动条，thumb 悬浮不占布局宽度 */
const VirtualScrollbar = forwardRef<HTMLDivElement, VirtualScrollbarProps>(
  (
    {
      children,
      direction = 'vertical',
      autoHide = true,
      className,
      wrapperClassName,
      style,
      onScroll,
      ...rest
    },
    ref,
  ) => {
    const viewportRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => viewportRef.current as HTMLDivElement);

    const {
      metrics,
      active,
      handleScroll,
      handleMouseEnter,
      handleMouseLeave,
      startDrag,
      handleTrackClick,
    } = useVirtualScrollbar(viewportRef, direction, autoHide);

    const showVertical = direction === 'vertical' || direction === 'both';
    const showHorizontal = direction === 'horizontal' || direction === 'both';

    const handleViewportScroll = (event: React.UIEvent<HTMLDivElement>) => {
      handleScroll();
      onScroll?.(event);
    };

    const rootClass = classNames(
      classNames('virtual-scrollbar-root', styles['virtual-scrollbar-root']),
      active && classNames('virtual-scrollbar-root-active', styles['virtual-scrollbar-root-active']),
      wrapperClassName,
    );

    return (
      <div
        className={rootClass}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={viewportRef}
          className={classNames('virtual-scrollbar-viewport', styles['virtual-scrollbar-viewport'], className)}
          onScroll={handleViewportScroll}
          {...rest}
        >
          {children}
        </div>

        {showVertical && metrics.vertical.visible && (
          <div
            className={classNames('virtual-scrollbar-track-vertical', styles['virtual-scrollbar-track-vertical'])}
            onMouseDown={(event) => handleTrackClick('vertical', event)}
          >
            <div
              className={classNames('virtual-scrollbar-thumb', styles['virtual-scrollbar-thumb'])}
              style={{
                height: metrics.vertical.size,
                transform: `translateY(${metrics.vertical.offset}px)`,
              }}
              onMouseDown={(event) => startDrag('vertical', event)}
            />
          </div>
        )}

        {showHorizontal && metrics.horizontal.visible && (
          <div
            className={classNames('virtual-scrollbar-track-horizontal', styles['virtual-scrollbar-track-horizontal'])}
            onMouseDown={(event) => handleTrackClick('horizontal', event)}
          >
            <div
              className={classNames('virtual-scrollbar-thumb', styles['virtual-scrollbar-thumb'])}
              style={{
                width: metrics.horizontal.size,
                transform: `translateX(${metrics.horizontal.offset}px)`,
              }}
              onMouseDown={(event) => startDrag('horizontal', event)}
            />
          </div>
        )}
      </div>
    );
  },
);

VirtualScrollbar.displayName = 'VirtualScrollbar';

export default VirtualScrollbar;
