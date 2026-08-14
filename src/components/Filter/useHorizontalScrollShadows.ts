import { useCallback, useEffect, useState, type RefObject } from 'react';

/**
 * 横向滚动边缘阴影：根据 overflow + scrollLeft 决定是否显示左右渐变。
 */
export function useHorizontalScrollShadows(scrollRef: RefObject<HTMLElement | null>) {
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setShowPrev(false);
      setShowNext(false);
      return;
    }
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = scrollWidth - clientWidth;
    setShowPrev(scrollLeft > 1);
    setShowNext(max > 1 && scrollLeft < max - 1);
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(update);
    });
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [scrollRef, update]);

  return { showPrev, showNext, update };
}
