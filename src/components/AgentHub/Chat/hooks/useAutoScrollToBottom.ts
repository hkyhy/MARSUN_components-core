import { type RefObject, useCallback, useEffect, useRef } from 'react';

interface UseAutoScrollToBottomOptions {
  /** When true, always scroll regardless of current scroll position */
  force?: boolean;
  /** Pixel threshold to treat the viewport as "at bottom" */
  threshold?: number;
  /** Re-run scroll when this value changes (e.g. messages) */
  trigger?: unknown;
  /** Disable observers when there is nothing to scroll */
  enabled?: boolean;
}

/**
 * Keeps a scroll container pinned to the bottom while messages grow,
 * including typewriter-driven height changes that do not update React state.
 */
export function useAutoScrollToBottom(
  containerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  options: UseAutoScrollToBottomOptions = {},
) {
  const { force = false, threshold = 80, trigger, enabled = true } = options;
  const stickToBottomRef = useRef(true);
  const prevTriggerRef = useRef(trigger);

  const isNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  }, [containerRef, threshold]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      const el = containerRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior });
    },
    [containerRef],
  );

  const handleScroll = useCallback(() => {
    stickToBottomRef.current = isNearBottom();
  }, [isNearBottom]);

  const stickToBottom = useCallback(() => {
    stickToBottomRef.current = true;
  }, []);

  const shouldScroll = useCallback(() => {
    return force || stickToBottomRef.current;
  }, [force]);

  useEffect(() => {
    const triggerChanged = trigger !== prevTriggerRef.current;
    if (triggerChanged) {
      prevTriggerRef.current = trigger;
      stickToBottomRef.current = true;
      return;
    }

    if (!enabled) return;
    if (!force && !stickToBottomRef.current) return;

    scrollToBottom('auto');
  }, [enabled, force, trigger, scrollToBottom]);

  useEffect(() => {
    const content = contentRef.current;
    if (!enabled || !content) return;

    const observer = new ResizeObserver(() => {
      if (shouldScroll()) {
        scrollToBottom('auto');
      }
    });

    observer.observe(content);
    return () => observer.disconnect();
  }, [contentRef, enabled, force, shouldScroll, scrollToBottom]);

  return { scrollToBottom, stickToBottom, handleScroll };
}
