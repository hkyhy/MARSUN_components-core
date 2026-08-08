// @ts-nocheck
const MIN_MOBILE_POPUP_HEIGHT = 160;

/**
 * 计算移动端筛选弹层 top/height。
 * 页面底部（如历史房间）时 scrollEl 可见底边可能紧贴 trigger，不能只信 scrollRect.bottom。
 */
export const getMobilePopupMetrics = (
  triggerEl,
  { scrollEl, boundaryEl, useBoundaryMount, offset = 4 } = {},
) => {
  if (typeof window === 'undefined' || !triggerEl) {
    return { top: 0, left: 0, height: 0, width: 0 };
  }

  const rect = triggerEl.getBoundingClientRect();

  if (useBoundaryMount && boundaryEl) {
    const boundaryRect = boundaryEl.getBoundingClientRect();
    const top = Math.max(rect.bottom - boundaryRect.top + offset, 0);
    const available = Math.max(boundaryRect.height - top, 0);
    const height =
      available >= MIN_MOBILE_POPUP_HEIGHT
        ? available
        : Math.max(available, Math.min(MIN_MOBILE_POPUP_HEIGHT, boundaryRect.height - offset));

    return {
      top,
      left: 0,
      height,
      width: boundaryRect.width,
    };
  }

  const scrollRect = scrollEl?.getBoundingClientRect?.();
  const visibleTop = scrollRect?.top ?? 0;
  // 与视口取较大底边，避免页面底部筛选算出 height=0
  const visibleBottom = Math.max(scrollRect?.bottom ?? 0, window.innerHeight);
  const width = scrollRect?.width || window.innerWidth;
  const top = Math.max(rect.bottom + offset, visibleTop);
  const available = Math.max(visibleBottom - top, 0);
  const height =
    available >= MIN_MOBILE_POPUP_HEIGHT
      ? available
      : Math.max(available, Math.min(MIN_MOBILE_POPUP_HEIGHT, window.innerHeight - top));

  return {
    top,
    left: 0,
    height: Math.max(height, 0),
    width,
  };
};
