// @ts-nocheck
import { useEffect, useRef } from 'react';
import {
  applyViewportCssVars,
  resetViewportCssVars,
  useResponsiveContext,
} from '@kne/responsive-utils';

const useFilterViewportVars = () => {
  const boundaryRef = useRef(null);
  const { mode } = useResponsiveContext();

  useEffect(() => {
    const el = boundaryRef.current;
    if (!el || typeof window === 'undefined' || mode === 'container') {
      return undefined;
    }

    const update = () => {
      applyViewportCssVars(el, {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    update();
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      resetViewportCssVars(el);
    };
  }, [mode]);

  return boundaryRef;
};

export default useFilterViewportVars;
