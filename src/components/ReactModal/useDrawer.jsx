// @ts-nocheck
// Ported from https://github.com/kne-union/react-modal/blob/master/src/useDrawer.js
import {
  createRef,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Drawer as AntdDrawer } from 'antd';
import { useMobilePopupMount, useScrollElement } from '@kne/responsive-utils';
import { computedDrawerProps, lockParentScroll, resolveDrawerGetContainer } from './Drawer';
import usePatchElement from './usePatchElement';

const VIEWPORT_EXAMPLE_SELECTORS = ['.example-driver-device-scroll'];

const boundaryPopupMountOptions = {
  cover: 'boundary',
  exampleSelectors: VIEWPORT_EXAMPLE_SELECTORS,
};

const wrapCustomGetContainer = (customGetContainer) => {
  if (!customGetContainer) {
    return undefined;
  }
  if (typeof customGetContainer === 'function') {
    return (triggerNode) => customGetContainer(triggerNode) || null;
  }
  return () => customGetContainer;
};

const drawerApiRef = { current: null };

let hookDrawerUuid = 0;

const HookDrawer = forwardRef(({ config, afterClose: hookAfterClose }, ref) => {
  const [open, setOpen] = useState(true);
  const [innerConfig, setInnerConfig] = useState(config);
  const hostRef = useRef(null);
  const { getPopupContainer, anchorRef } = useMobilePopupMount({
    ...boundaryPopupMountOptions,
    getPopupContainer: wrapCustomGetContainer(innerConfig.getContainer),
  });

  const close = () => {
    setOpen(false);
  };

  useImperativeHandle(ref, () => ({
    destroy: close,
    update: (newConfig) => {
      setInnerConfig((origin) =>
        Object.assign({}, origin, typeof newConfig === 'function' ? newConfig(origin) : newConfig),
      );
    },
  }));

  const { getContainer, afterClose: userAfterClose, ...restConfig } = innerConfig;
  const mergedAfterClose = (...args) => {
    hookAfterClose && hookAfterClose(...args);
    userAfterClose && userAfterClose(...args);
  };

  const drawerProps = computedDrawerProps({
    ...restConfig,
    onClose: close,
    afterClose: mergedAfterClose,
  });

  const getDrawerContainer = resolveDrawerGetContainer({
    customGetContainer: getContainer,
    getPopupContainer,
    getHostNode: () => hostRef.current,
  });

  return (
    <>
      <span
        ref={(node) => {
          hostRef.current = node;
          anchorRef(node);
        }}
        aria-hidden="true"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      />
      <AntdDrawer {...drawerProps} open={open} getContainer={getDrawerContainer} />
    </>
  );
});

const ElementsHolder = memo(
  forwardRef((_props, ref) => {
    const [elements, patchElement] = usePatchElement();
    useImperativeHandle(ref, () => ({ patchElement }), [patchElement]);
    return <>{elements}</>;
  }),
);

const useDrawerHolder = () => {
  const holderRef = useRef(null);
  const [actionQueue, setActionQueue] = useState([]);
  const { resolveMount, getPopupContainer } = useMobilePopupMount(boundaryPopupMountOptions);
  const getScrollElement = useScrollElement();

  useEffect(() => {
    if (actionQueue.length) {
      const cloneQueue = [...actionQueue];
      cloneQueue.forEach((action) => action());
      setActionQueue([]);
    }
  }, [actionQueue]);

  const drawer = useCallback(
    (props) => {
      hookDrawerUuid += 1;
      const drawerRef = createRef();
      const api = {};
      let closeFunc;
      let unlock = () => {};

      const runOpen = () => {
        const anchor = typeof document !== 'undefined' ? document.activeElement : null;
        const { isMobile, fixedModeClass } = resolveMount(anchor);
        unlock = lockParentScroll(getScrollElement);
        const {
          afterClose: userAfterClose,
          getContainer: customGetContainer,
          ...restProps
        } = props;

        const drawerEl = (
          <HookDrawer
            key={`react-drawer-${hookDrawerUuid}`}
            ref={drawerRef}
            config={{
              ...restProps,
              isMobile,
              fixedModeClass,
              getContainer: customGetContainer,
              onClose: () => api.close(),
              afterClose: (...args) => {
                unlock();
                userAfterClose && userAfterClose(...args);
              },
            }}
            afterClose={() => {
              closeFunc && closeFunc();
            }}
          />
        );

        closeFunc = holderRef.current?.patchElement(drawerEl);
      };

      if (holderRef.current?.patchElement) {
        runOpen();
      } else {
        setActionQueue((prev) => [...prev, runOpen]);
      }

      api.close = () => {
        if (drawerRef.current) {
          drawerRef.current.destroy();
        } else {
          setActionQueue((prev) => [...prev, () => drawerRef.current?.destroy()]);
        }
      };

      return api;
    },
    [getScrollElement, resolveMount],
  );

  return [drawer, <ElementsHolder key="drawer-elements-holder" ref={holderRef} />];
};

export const DrawerContextHolder = () => {
  const [drawer, contextHolder] = useDrawerHolder();
  drawerApiRef.current = drawer;
  return contextHolder;
};

export const useDrawer = () => {
  if (!drawerApiRef.current) {
    throw new Error(
      'useDrawer requires <DrawerContextHolder /> mounted inside <App> before calling useDrawer()',
    );
  }
  return drawerApiRef.current;
};

export default useDrawer;
