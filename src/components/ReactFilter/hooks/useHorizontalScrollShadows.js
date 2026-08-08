// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from 'react';
import useResponsiveScrollListener from './useResponsiveScrollListener';

const useHorizontalScrollShadows = ({
  enabled,
  suspend = false,
  preserveOverflowOnSuspend = false,
  refreshKey,
} = {}) => {
  const scrollRef = useRef(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const [showScrollPrev, setShowScrollPrev] = useState(false);
  const [showScrollNext, setShowScrollNext] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !enabled) {
      setShowScrollPrev(false);
      setShowScrollNext(false);
      setIsOverflow(false);
      return;
    }

    if (suspend) {
      setShowScrollPrev(false);
      setShowScrollNext(false);
      if (!preserveOverflowOnSuspend) {
        setIsOverflow(false);
      }
      return;
    }

    setIsOverflow(el.scrollWidth > el.clientWidth);
    setShowScrollPrev(el.scrollLeft > 1);
    setShowScrollNext(
      el.scrollWidth > el.clientWidth && el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    );
  }, [enabled, preserveOverflowOnSuspend, suspend]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !enabled || suspend) {
      update();
      return;
    }

    update();
    el.addEventListener('scroll', update);

    // 双 rAF：等父级 flex（如 toolbar 右侧 buttonGroup）完成布局后再测一次
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      update();
      raf2 = window.requestAnimationFrame(update);
    });

    // 容器自身/父级宽度变化时重测（初始化时父级可能尚未收窄，仅靠 scroll 事件不够）
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(el);
      if (el.parentElement) {
        resizeObserver.observe(el.parentElement);
      }
    }

    return () => {
      el.removeEventListener('scroll', update);
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      resizeObserver?.disconnect();
    };
  }, [enabled, refreshKey, suspend, update]);

  useResponsiveScrollListener(update, enabled && !suspend);

  return {
    scrollRef,
    isOverflow,
    showScrollPrev,
    showScrollNext,
    updateScrollShadowVisible: update,
  };
};

export default useHorizontalScrollShadows;
