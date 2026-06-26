export interface AnimateScrollOptions {
  minDuration?: number;
  maxDuration?: number;
  msPerPixel?: number;
}

const easeOutQuint = (progress: number) => 1 - (1 - progress) ** 5;

/**
 * Smoothly scroll an element with a custom ease-out curve (softer than native smooth).
 */
export const animateScrollTo = (
  element: HTMLElement,
  targetTop: number,
  options: AnimateScrollOptions = {},
): (() => void) => {
  const { minDuration = 420, maxDuration = 880, msPerPixel = 0.32 } = options;

  const maxTop = Math.max(0, element.scrollHeight - element.clientHeight);
  const clampedTarget = Math.min(Math.max(0, targetTop), maxTop);
  const startTop = element.scrollTop;
  const distance = clampedTarget - startTop;

  if (Math.abs(distance) < 1) {
    element.scrollTop = clampedTarget;
    return () => {};
  }

  const duration = Math.min(Math.max(Math.abs(distance) * msPerPixel, minDuration), maxDuration);
  const startTime = performance.now();
  let rafId = 0;
  let cancelled = false;

  const step = (now: number) => {
    if (cancelled) return;

    const progress = Math.min((now - startTime) / duration, 1);
    element.scrollTop = startTop + distance * easeOutQuint(progress);

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    }
  };

  rafId = requestAnimationFrame(step);

  return () => {
    cancelled = true;
    cancelAnimationFrame(rafId);
  };
};

export const getScrollBottom = (element: HTMLElement) =>
  Math.max(0, element.scrollHeight - element.clientHeight);

/**
 * Session switch: reset to top, then ease to bottom; optional soft correction after layout shifts.
 */
export const animateScrollFromTopToBottom = (
  element: HTMLElement,
  options: AnimateScrollOptions = {},
): (() => void) => {
  const cleanups: Array<() => void> = [];

  element.scrollTop = 0;

  const start = () => {
    cleanups.push(
      animateScrollTo(element, getScrollBottom(element), {
        minDuration: 460,
        maxDuration: 920,
        msPerPixel: 0.34,
        ...options,
      }),
    );

    const correctionTimer = window.setTimeout(() => {
      const bottom = getScrollBottom(element);
      const remaining = bottom - element.scrollTop;
      if (remaining > 6) {
        cleanups.push(
          animateScrollTo(element, bottom, {
            minDuration: 180,
            maxDuration: 320,
            msPerPixel: 0.2,
          }),
        );
      }
    }, 120);

    cleanups.push(() => window.clearTimeout(correctionTimer));
  };

  const raf = requestAnimationFrame(() => {
    requestAnimationFrame(start);
  });

  return () => {
    cancelAnimationFrame(raf);
    cleanups.forEach((cleanup) => cleanup());
  };
};
