// @ts-nocheck
import { useCallback } from 'react';
import { MOBILE_POPUP_MODE, useMobilePopupMount } from '@kne/responsive-utils';
import useFilterIsMobile from './useFilterIsMobile';

/**
 * Filter 弹层挂载：cover=viewport。
 * isMobile 与 useFilterIsMobile 一致（视口 / Provider container），不用 example DOM 兜底，
 * 避免 example 选 PC 时仍被判成移动端。
 */
const useFilterPopupContainer = (options = {}) => {
  const { getPopupContainer: getPopupContainerProp, ...rest } = options;
  const isMobile = useFilterIsMobile();
  const {
    fixedModeClass: mountFixedModeClass,
    getMountNode,
    getPopupContainer,
    resolveMount,
    anchorRef,
  } = useMobilePopupMount({
    cover: 'viewport',
    getPopupContainer: getPopupContainerProp,
    ...rest,
  });

  const fixedModeClass = isMobile ? mountFixedModeClass : null;
  const useBoundaryMount = !!(isMobile && fixedModeClass === MOBILE_POPUP_MODE.boundary);

  const getMountNodeSafe = useCallback(
    (triggerNode) =>
      getMountNode(triggerNode) || (typeof document !== 'undefined' ? document.body : null),
    [getMountNode],
  );

  return {
    isMobile,
    useBoundaryMount,
    fixedModeClass,
    getMountNode: getMountNodeSafe,
    getPopupContainer,
    resolveMount,
    anchorRef,
  };
};

export default useFilterPopupContainer;
