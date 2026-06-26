import { useEffect, useRef, useState } from 'react';

interface UseTypewriterOptions {
  /** Fixed reveal rate in characters per second. Default: 60 */
  charsPerSecond?: number;
}

/**
 * Smoothly reveals streaming text character-by-character using requestAnimationFrame.
 *
 * Live streaming messages animate from empty; once the stream ends, any remaining
 * characters continue at the same rate until fully revealed. Historical messages
 * with `streaming: false` that were never streamed show in full immediately.
 */
export function useTypewriter(
  content: string,
  streaming: boolean,
  options: UseTypewriterOptions = {},
) {
  const { charsPerSecond = 60 } = options;

  const wasStreamingRef = useRef(streaming);
  const [displayedLength, setDisplayedLength] = useState(() => (streaming ? 0 : content.length));
  const rafRef = useRef<number>(0);
  const prevContentLenRef = useRef(0);
  const carryRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const contentLengthRef = useRef(content.length);
  const displayedLengthRef = useRef(displayedLength);

  contentLengthRef.current = content.length;
  displayedLengthRef.current = displayedLength;

  useEffect(() => {
    if (streaming) {
      wasStreamingRef.current = true;
    }
  }, [streaming]);

  const isPendingReveal =
    wasStreamingRef.current && displayedLength < content.length;

  useEffect(() => {
    if (!isPendingReveal) return;

    let running = true;

    const loop = (now: number) => {
      if (!running) return;

      const target = contentLengthRef.current;
      const prev = displayedLengthRef.current;
      if (prev >= target) return;

      const deltaMs = now - lastTimeRef.current;
      lastTimeRef.current = now;

      const charsToAdd = (charsPerSecond * deltaMs) / 1000 + carryRef.current;
      const step = Math.floor(charsToAdd);
      carryRef.current = charsToAdd - step;

      if (step > 0) {
        const next = Math.min(prev + step, target);
        displayedLengthRef.current = next;
        setDisplayedLength(next);
      }

      if (displayedLengthRef.current < contentLengthRef.current) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [content.length, charsPerSecond, isPendingReveal]);

  useEffect(() => {
    if (displayedLength >= content.length && content.length > 0) {
      wasStreamingRef.current = false;
    }
  }, [displayedLength, content.length]);

  useEffect(() => {
    if (content.length === 0 && prevContentLenRef.current > 0) {
      wasStreamingRef.current = false;
      displayedLengthRef.current = 0;
      setDisplayedLength(0);
      carryRef.current = 0;
    }
    prevContentLenRef.current = content.length;
  }, [content.length]);

  return {
    displayed: content.slice(0, displayedLength),
    isTyping: wasStreamingRef.current && displayedLength < content.length,
  };
}
