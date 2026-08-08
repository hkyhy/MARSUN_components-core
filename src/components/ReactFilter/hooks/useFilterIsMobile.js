// @ts-nocheck
import {
  IS_MOBILE_QUERY,
  MOBILE_BREAKPOINT,
  useMediaQuery,
  useResponsiveContext,
} from '@kne/responsive-utils';

/**
 * Filter 移动端判定：默认按视口宽度，仅在 ResponsiveProvider container 模式下按预览容器宽度。
 * 避免 Filter 嵌入窄列时误用移动端布局。
 */
const useFilterIsMobile = () => {
  const { mode, containerWidth } = useResponsiveContext();
  const viewportIsMobile = useMediaQuery(IS_MOBILE_QUERY);

  if (mode === 'container' && typeof containerWidth === 'number') {
    return containerWidth < MOBILE_BREAKPOINT;
  }

  return viewportIsMobile;
};

export default useFilterIsMobile;
