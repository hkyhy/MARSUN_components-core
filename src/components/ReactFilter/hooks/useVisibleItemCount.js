// @ts-nocheck
import { useOverflowItems } from '@kne/overflow-items';

/**
 * Filter 扁平行可见数量：底层交给 @kne/overflow-items，保留原 selector / beforeReady=all 行为。
 */
const useVisibleItemCount = ({ items, enabled, strategy = 'asc' }) => {
  const safeItems = Array.isArray(items) ? items : [];

  const { setContainerRef, setMeasureRef, setMoreMeasureRef, visibleCount, ready } =
    useOverflowItems({
      itemCount: safeItems.length,
      items: safeItems,
      enabled,
      strategy,
      gap: 8,
      safetyGap: 2,
      expandHysteresis: 16,
      settle: 100,
      maxSettle: 400,
      beforeReady: 'all',
      itemSelector: '[data-filter-measure-item]',
      observeParent: true,
      debounce: 0,
    });

  return { setContainerRef, setMeasureRef, setMoreMeasureRef, visibleCount, ready };
};

export default useVisibleItemCount;
