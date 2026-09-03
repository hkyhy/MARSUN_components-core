// @ts-nocheck
// Ported from https://github.com/kne-union/react-modal/blob/master/src/lockParentScroll.js
import { useEffect } from 'react';

let parentScrollLockCount = 0;
let parentScrollLocked = [];

/** Modal / Drawer 共用：锁 body + layout scroll，避免背后页面滚动 */
export const lockParentScroll = (getScrollElement) => {
  parentScrollLockCount += 1;
  if (parentScrollLockCount === 1) {
    const targets = [document.body];
    const scrollEl = typeof getScrollElement === 'function' ? getScrollElement() : null;
    if (scrollEl && scrollEl !== document.body && !targets.includes(scrollEl)) {
      targets.push(scrollEl);
    }
    parentScrollLocked = targets.map((el) => {
      const prev = {
        overflow: el.style.overflow,
        overscrollBehavior: el.style.overscrollBehavior,
      };
      el.style.overflow = 'hidden';
      el.style.overscrollBehavior = 'none';
      return { el, prev };
    });
  }
  return () => {
    parentScrollLockCount = Math.max(0, parentScrollLockCount - 1);
    if (parentScrollLockCount === 0) {
      parentScrollLocked.forEach(({ el, prev }) => {
        el.style.overflow = prev.overflow;
        el.style.overscrollBehavior = prev.overscrollBehavior;
      });
      parentScrollLocked = [];
    }
  };
};

export const useLockParentScroll = (enabled, getScrollElement) => {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    return lockParentScroll(getScrollElement);
  }, [enabled, getScrollElement]);
};

export default lockParentScroll;
