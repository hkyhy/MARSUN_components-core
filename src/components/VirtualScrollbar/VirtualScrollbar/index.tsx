import React, { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
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
  /**
   * 子树重渲染 / Modal 关窗 focus 回写等导致 scrollTop 被清零时，恢复上次滚动位置。
   * 默认 true。
   */
  preserveScroll?: boolean;
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
      preserveScroll = true,
      ...rest
    },
    ref,
  ) => {
    const viewportRef = useRef<HTMLDivElement>(null);
    const savedScrollRef = useRef({ top: 0, left: 0 });

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
      const t = event.currentTarget;
      savedScrollRef.current = { top: t.scrollTop, left: t.scrollLeft };
      handleScroll();
      onScroll?.(event);
    };

    /**
     * Modal 关闭 focusTriggerAfterClose / 子树高度瞬间塌缩时，浏览器常把 scrollTop 打成 0。
     * 在 layout 与下一帧各恢复一次，盖住 focus scrollIntoView。
     */
    useLayoutEffect(() => {
      if (!preserveScroll) return;
      const el = viewportRef.current;
      if (!el) return;
      const { top, left } = savedScrollRef.current;
      const restore = () => {
        if (top > 0 && el.scrollTop === 0) el.scrollTop = top;
        if (left > 0 && el.scrollLeft === 0) el.scrollLeft = left;
      };
      restore();
      const id = window.requestAnimationFrame(restore);
      return () => window.cancelAnimationFrame(id);
    });

    const rootClass = classNames(
      classNames('virtual-scrollbar-root', styles['virtual-scrollbar-root']),
      active &&
        classNames('virtual-scrollbar-root-active', styles['virtual-scrollbar-root-active']),
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
          className={classNames(
            'virtual-scrollbar-viewport',
            styles['virtual-scrollbar-viewport'],
            className,
          )}
          onScroll={handleViewportScroll}
          {...rest}
        >
          {children}
        </div>

        {showVertical && metrics.vertical.visible && (
          <div
            className={classNames(
              'virtual-scrollbar-track-vertical',
              styles['virtual-scrollbar-track-vertical'],
            )}
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
            className={classNames(
              'virtual-scrollbar-track-horizontal',
              styles['virtual-scrollbar-track-horizontal'],
            )}
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
