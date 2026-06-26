import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

export type ScrollDirection = 'vertical' | 'horizontal' | 'both';

export interface ThumbMetrics {
  vertical: { size: number; offset: number; visible: boolean };
  horizontal: { size: number; offset: number; visible: boolean };
}

const MIN_THUMB_SIZE = 24;
const AUTO_HIDE_DELAY = 1000;

const emptyMetrics: ThumbMetrics = {
  vertical: { size: 0, offset: 0, visible: false },
  horizontal: { size: 0, offset: 0, visible: false },
};

function computeAxisMetrics(
  scrollSize: number,
  clientSize: number,
  scrollOffset: number,
): { size: number; offset: number; visible: boolean } {
  if (scrollSize <= clientSize) {
    return { size: 0, offset: 0, visible: false };
  }

  const trackSize = clientSize;
  const size = Math.max(MIN_THUMB_SIZE, (clientSize / scrollSize) * trackSize);
  const maxScroll = scrollSize - clientSize;
  const maxThumbOffset = trackSize - size;
  const offset = maxScroll > 0 ? (scrollOffset / maxScroll) * maxThumbOffset : 0;

  return { size, offset, visible: true };
}

export function useVirtualScrollbar(
  viewportRef: RefObject<HTMLDivElement | null>,
  direction: ScrollDirection = 'vertical',
  autoHide = true,
) {
  const [metrics, setMetrics] = useState<ThumbMetrics>(emptyMetrics);
  const [active, setActive] = useState(!autoHide);
  const hideTimerRef = useRef<number | null>(null);
  const draggingRef = useRef<{
    axis: 'vertical' | 'horizontal';
    startPointer: number;
    startScroll: number;
    thumbSize: number;
    clientSize: number;
    scrollSize: number;
  } | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    if (!autoHide) return;
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => setActive(false), AUTO_HIDE_DELAY);
  }, [autoHide, clearHideTimer]);

  const showThumb = useCallback(() => {
    setActive(true);
    scheduleHide();
  }, [scheduleHide]);

  const updateMetrics = useCallback(() => {
    const el = viewportRef.current;
    if (!el) {
      setMetrics(emptyMetrics);
      return;
    }

    const showVertical = direction === 'vertical' || direction === 'both';
    const showHorizontal = direction === 'horizontal' || direction === 'both';

    setMetrics({
      vertical: showVertical
        ? computeAxisMetrics(el.scrollHeight, el.clientHeight, el.scrollTop)
        : emptyMetrics.vertical,
      horizontal: showHorizontal
        ? computeAxisMetrics(el.scrollWidth, el.clientWidth, el.scrollLeft)
        : emptyMetrics.horizontal,
    });
  }, [direction, viewportRef]);

  useEffect(() => {
    updateMetrics();
  }, [updateMetrics]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => updateMetrics());
    observer.observe(el);
    if (el.firstElementChild) {
      observer.observe(el.firstElementChild);
    }

    return () => observer.disconnect();
  }, [updateMetrics, viewportRef]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const drag = draggingRef.current;
      const el = viewportRef.current;
      if (!drag || !el) return;

      event.preventDefault();
      const delta =
        drag.axis === 'vertical'
          ? event.clientY - drag.startPointer
          : event.clientX - drag.startPointer;
      const maxScroll = drag.scrollSize - drag.clientSize;
      const maxThumbOffset = drag.clientSize - drag.thumbSize;
      const scrollDelta = maxThumbOffset > 0 ? (delta / maxThumbOffset) * maxScroll : 0;
      const nextScroll = drag.startScroll + scrollDelta;

      if (drag.axis === 'vertical') {
        el.scrollTop = nextScroll;
      } else {
        el.scrollLeft = nextScroll;
      }
      updateMetrics();
    };

    const handleMouseUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = null;
      scheduleHide();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [scheduleHide, updateMetrics, viewportRef]);

  useEffect(() => () => clearHideTimer(), [clearHideTimer]);

  const handleScroll = useCallback(() => {
    updateMetrics();
    showThumb();
  }, [showThumb, updateMetrics]);

  const handleMouseEnter = useCallback(() => {
    setActive(true);
    clearHideTimer();
  }, [clearHideTimer]);

  const handleMouseLeave = useCallback(() => {
    if (!draggingRef.current) {
      scheduleHide();
    }
  }, [scheduleHide]);

  const startDrag = useCallback(
    (axis: 'vertical' | 'horizontal', event: React.MouseEvent) => {
      const el = viewportRef.current;
      if (!el) return;

      event.preventDefault();
      event.stopPropagation();
      showThumb();

      const isVertical = axis === 'vertical';
      draggingRef.current = {
        axis,
        startPointer: isVertical ? event.clientY : event.clientX,
        startScroll: isVertical ? el.scrollTop : el.scrollLeft,
        thumbSize: isVertical ? metrics.vertical.size : metrics.horizontal.size,
        clientSize: isVertical ? el.clientHeight : el.clientWidth,
        scrollSize: isVertical ? el.scrollHeight : el.scrollWidth,
      };
    },
    [metrics.horizontal.size, metrics.vertical.size, showThumb, viewportRef],
  );

  const handleTrackClick = useCallback(
    (axis: 'vertical' | 'horizontal', event: React.MouseEvent<HTMLDivElement>) => {
      const el = viewportRef.current;
      if (!el || event.target !== event.currentTarget) return;

      showThumb();
      const rect = event.currentTarget.getBoundingClientRect();
      const isVertical = axis === 'vertical';
      const pointer = isVertical ? event.clientY - rect.top : event.clientX - rect.left;
      const clientSize = isVertical ? el.clientHeight : el.clientWidth;
      const scrollSize = isVertical ? el.scrollHeight : el.scrollWidth;
      const thumbSize = isVertical ? metrics.vertical.size : metrics.horizontal.size;
      const maxScroll = scrollSize - clientSize;
      const maxThumbOffset = clientSize - thumbSize;
      const targetThumbOffset = Math.max(0, Math.min(pointer - thumbSize / 2, maxThumbOffset));
      const nextScroll = maxThumbOffset > 0 ? (targetThumbOffset / maxThumbOffset) * maxScroll : 0;

      if (isVertical) {
        el.scrollTop = nextScroll;
      } else {
        el.scrollLeft = nextScroll;
      }
      updateMetrics();
    },
    [metrics.horizontal.size, metrics.vertical.size, showThumb, updateMetrics, viewportRef],
  );

  return {
    metrics,
    active,
    handleScroll,
    handleMouseEnter,
    handleMouseLeave,
    startDrag,
    handleTrackClick,
  };
}
