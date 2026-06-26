import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTypewriter } from '../useTypewriter';

describe('useTypewriter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows historical messages in full without animation', () => {
    const { result } = renderHook(() => useTypewriter('hello world', false));

    expect(result.current.displayed).toBe('hello world');
    expect(result.current.isTyping).toBe(false);
  });

  it('continues revealing after streaming ends instead of jumping to full text', async () => {
    let rafCallback: FrameRequestCallback | null = null;
    let now = 0;

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb;
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {
      rafCallback = null;
    });
    vi.spyOn(performance, 'now').mockImplementation(() => now);

    const advanceFrames = (frames: number, msPerFrame = 1000 / 60) => {
      for (let i = 0; i < frames; i += 1) {
        now += msPerFrame;
        rafCallback?.(now);
      }
    };

    const { result, rerender } = renderHook(
      ({ content, streaming }) => useTypewriter(content, streaming, { charsPerSecond: 60 }),
      {
        initialProps: { content: 'a'.repeat(120), streaming: true },
      },
    );

    await act(async () => {
      advanceFrames(2);
    });

    const displayedWhileStreaming = result.current.displayed;
    expect(displayedWhileStreaming.length).toBeGreaterThan(0);
    expect(displayedWhileStreaming.length).toBeLessThan(120);

    await act(async () => {
      rerender({ content: 'a'.repeat(120), streaming: false });
      advanceFrames(2);
    });

    expect(result.current.displayed.length).toBeGreaterThan(displayedWhileStreaming.length);
    expect(result.current.displayed.length).toBeLessThan(120);
    expect(result.current.isTyping).toBe(true);
  });
});
