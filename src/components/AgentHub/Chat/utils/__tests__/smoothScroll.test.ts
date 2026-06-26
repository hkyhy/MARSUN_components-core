import { describe, expect, it } from 'vitest';
import { animateScrollTo, getScrollBottom } from '../smoothScroll';

describe('smoothScroll', () => {
  it('computes scroll bottom from element metrics', () => {
    const element = {
      scrollHeight: 1200,
      clientHeight: 400,
      scrollTop: 0,
    } as HTMLElement;

    expect(getScrollBottom(element)).toBe(800);
  });

  it('animates toward target and can be cancelled', () => {
    const element = {
      scrollHeight: 1000,
      clientHeight: 200,
      scrollTop: 0,
    } as HTMLElement;

    let rafCallback: FrameRequestCallback | null = null;
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        rafCallback = cb;
        return 1;
      });
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});

    const cleanup = animateScrollTo(element, 800, { minDuration: 100, maxDuration: 100 });

    expect(rafSpy).toHaveBeenCalled();

    rafCallback?.(performance.now() + 50);
    expect(element.scrollTop).toBeGreaterThan(0);
    expect(element.scrollTop).toBeLessThan(800);

    cleanup();
    expect(cancelSpy).toHaveBeenCalledWith(1);

    rafSpy.mockRestore();
    cancelSpy.mockRestore();
  });
});
