import { useEffect, useState, type RefObject } from 'react';

/** 与 ReactFilter / styles §8.12 对齐的窄屏断点（px） */
export const FILTER_MOBILE_BREAKPOINT = 768;

export type UseFilterLayoutModeOptions = {
  /** 仅当 measureContainer 为 true 时按该元素宽度判定 */
  containerRef?: RefObject<HTMLElement | null>;
  /**
   * 是否按容器宽度判定。默认 false：只跟视口，避免 showcase 半栏 / 侧栏误判移动端。
   */
  measureContainer?: boolean;
};

/**
 * 筛选栏布局模式。
 * - 默认：视口 matchMedia(max-width: 767px)
 * - measureContainer + containerRef：按容器 clientWidth（窄预览场景显式开启）
 */
export function useFilterLayoutMode(options: UseFilterLayoutModeOptions = {}) {
  const { containerRef, measureContainer = false } = options;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (measureContainer && containerRef) {
      let cleanup: (() => void) | undefined;
      const bind = () => {
        const el = containerRef.current;
        if (!el) return false;
        const update = () => setIsMobile(el.clientWidth < FILTER_MOBILE_BREAKPOINT);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        cleanup = () => ro.disconnect();
        return true;
      };
      if (!bind()) {
        const raf = requestAnimationFrame(() => {
          if (!bind()) {
            // 容器尚未挂载时回退视口，避免卡在 false
            const mq = window.matchMedia(`(max-width: ${FILTER_MOBILE_BREAKPOINT - 1}px)`);
            const update = () => setIsMobile(mq.matches);
            update();
            mq.addEventListener('change', update);
            cleanup = () => mq.removeEventListener('change', update);
          }
        });
        return () => {
          cancelAnimationFrame(raf);
          cleanup?.();
        };
      }
      return () => cleanup?.();
    }

    const mq = window.matchMedia(`(max-width: ${FILTER_MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [containerRef, measureContainer]);

  return { isMobile };
}
