// @ts-nocheck
import { useEffect } from 'react';
import { useScrollElement } from '@kne/responsive-utils';

const useResponsiveScrollListener = (callback, enabled = true) => {
  const getScrollElement = useScrollElement();

  useEffect(() => {
    if (!enabled || typeof callback !== 'function') {
      return undefined;
    }

    const scrollEl = getScrollElement();
    if (!scrollEl) {
      return undefined;
    }

    callback();

    const handleChange = () => {
      callback();
    };

    scrollEl.addEventListener('scroll', handleChange, { passive: true });
    window.addEventListener('resize', handleChange);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleChange);
      resizeObserver.observe(scrollEl);
    }

    return () => {
      scrollEl.removeEventListener('scroll', handleChange);
      window.removeEventListener('resize', handleChange);
      resizeObserver?.disconnect();
    };
  }, [callback, enabled, getScrollElement]);
};

export default useResponsiveScrollListener;
