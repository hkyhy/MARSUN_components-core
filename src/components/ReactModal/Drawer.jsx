// @ts-nocheck
// Ported from https://github.com/kne-union/react-modal/blob/master/src/Drawer.js
import { useEffect, useRef } from 'react';
import { Button, Drawer as AntdDrawer } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { useMobilePopupMount, useScrollElement } from '@kne/responsive-utils';
import withLocale from './withLocale';
import Footer from './Footer';
import SimpleBar from './SimpleBar';
import style from './drawer.module.scss';

const DrawerLocaleRoot = withLocale(({ children }) => children);

const VIEWPORT_EXAMPLE_SELECTORS = ['.example-driver-device-scroll'];

const boundaryPopupMountOptions = {
  cover: 'boundary',
  exampleSelectors: VIEWPORT_EXAMPLE_SELECTORS,
};

const renderWithOptions = (value, options) => {
  if (typeof value === 'function') {
    return value(options);
  }
  return value;
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

const isVerticalPlacement = (placement) => placement === 'top' || placement === 'bottom';

const findParentDrawerMountHost = (node) => {
  if (!node || typeof node.closest !== 'function') {
    return null;
  }
  const parentRoot = node.closest('.ant-drawer-root');
  if (!parentRoot) {
    return null;
  }
  return parentRoot.parentElement || (typeof document !== 'undefined' ? document.body : null);
};

export const resolveDrawerGetContainer = ({
  customGetContainer,
  getPopupContainer,
  getHostNode,
}) => {
  const wrappedCustom = wrapCustomGetContainer(customGetContainer);
  return (triggerNode) => {
    if (wrappedCustom) {
      const custom = wrappedCustom(triggerNode);
      if (custom) {
        return custom;
      }
    }
    const from = triggerNode || (typeof getHostNode === 'function' ? getHostNode() : null);
    const nestedHost = findParentDrawerMountHost(from);
    if (nestedHost) {
      return nestedHost;
    }
    return getPopupContainer(triggerNode);
  };
};

let parentScrollLockCount = 0;
let parentScrollLocked = [];

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

const useLockParentScroll = (enabled, getScrollElement) => {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    return lockParentScroll(getScrollElement);
  }, [enabled, getScrollElement]);
};

const sizeStyleVars = (size, hasFooter) => {
  const minBase = size === 'small' ? 300 : 500;
  const chrome = 48 + (hasFooter ? 69 : 0);
  const minHeight = `${Math.max(0, minBase - chrome)}px`;
  const largeDim =
    typeof window !== 'undefined' ? `${Math.min(window.innerWidth - 64, 1500)}px` : '1500px';

  if (size === 'large') {
    return { dimension: largeDim, '--kne-drawer-body-min-height': minHeight };
  }
  if (size === 'small') {
    return { dimension: '600px', '--kne-drawer-body-min-height': minHeight };
  }
  return { dimension: '1000px', '--kne-drawer-body-min-height': minHeight };
};

const DrawerOuter = ({
  title,
  footer,
  footerButtons,
  noPadding,
  onClose,
  closable,
  onConfirm,
  onCancel,
  children,
  targetProps,
  cancelText,
  confirmText,
  isMobile,
  bodyScroll,
}) => {
  const effectiveNoPadding = noPadding ?? bodyScroll === false;
  const bodyInner = (
    <div
      className={classnames(style['drawer-body-inner'], 'drawer-body-inner', 'modal-body-inner', {
        [style['no-padding']]: effectiveNoPadding,
      })}
    >
      {children}
    </div>
  );

  const bodyClassName = classnames(style['drawer-body'], 'drawer-body', 'modal-body');

  return (
    <div
      className={classnames(style['drawer-outer'], 'drawer-container', {
        [style['is-mobile']]: isMobile,
        [style['no-title']]: !title,
        [style['no-footer']]: footer === null && footerButtons === undefined,
        [style['no-padding']]: effectiveNoPadding,
      })}
      data-testid="react-drawer"
    >
      {closable === false ? null : (
        <Button
          data-testid="react-drawer-close-btn"
          className={classnames(style['drawer-close'], 'drawer-close')}
          type="text"
          icon={<CloseOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onClose && onClose();
          }}
        />
      )}
      {title ? (
        <div className={classnames(style['drawer-title'], 'drawer-title', 'modal-title')}>
          {title}
        </div>
      ) : null}
      {bodyScroll !== false ? (
        <SimpleBar className={bodyClassName} style={{ height: 'var(--kne-drawer-body-height)' }}>
          {bodyInner}
        </SimpleBar>
      ) : (
        <div className={classnames(bodyClassName, style['body-scroll-off'])}>{bodyInner}</div>
      )}
      {footer === null && footerButtons === undefined ? null : (
        <Footer
          footer={footer}
          footerButtons={footerButtons}
          onConfirm={onConfirm}
          confirmText={confirmText}
          onCancel={onCancel}
          cancelText={cancelText}
          onClose={onClose}
          targetProps={targetProps}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export const computedDrawerProps = ({
  children,
  footer,
  footerButtons,
  className,
  size = 'default',
  placement = 'right',
  title,
  onClose,
  onConfirm,
  confirmText,
  onCancel,
  cancelText,
  closable,
  noPadding,
  bodyScroll = true,
  isMobile,
  fixedModeClass,
  rootClassName,
  classNames: propsClassNames,
  styles: propsStyles,
  style: propsStyle,
  width: propsWidth,
  height: propsHeight,
  modalRender,
  drawerRender,
  ...props
}) => {
  const vertical = isVerticalPlacement(placement);
  const hasFooter = !(footer === null && footerButtons === undefined);
  const { dimension, ...cssVars } = sizeStyleVars(size, hasFooter);
  const sizeProp = vertical
    ? { height: propsHeight ?? dimension }
    : { width: propsWidth ?? dimension };

  const runChildren = (options) => {
    const opts = Object.assign({}, options, { close: onClose });
    const drawerPanel = (
      <div className={classnames(style['drawer-panel-host'], 'drawer-panel-host')}>
        <div className={classnames(style['drawer-panel-body'], 'drawer-panel-body')}>
          <DrawerOuter
            title={renderWithOptions(title, opts)}
            closable={closable}
            onClose={onClose}
            onConfirm={onConfirm}
            confirmText={confirmText}
            onCancel={onCancel}
            cancelText={cancelText}
            footerButtons={renderWithOptions(footerButtons, opts)}
            noPadding={noPadding}
            footer={renderWithOptions(footer, opts)}
            targetProps={opts}
            isMobile={isMobile}
            bodyScroll={bodyScroll}
          >
            {renderWithOptions(children, opts)}
          </DrawerOuter>
        </div>
      </div>
    );

    return typeof modalRender === 'function' ? modalRender(drawerPanel) : drawerPanel;
  };

  const mobileWrapperClass = isMobile
    ? vertical
      ? style['drawer-wrapper-mobile-vertical']
      : style['drawer-wrapper-mobile']
    : null;

  const panelLayoutStyles = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
  };

  return {
    ...props,
    ...(drawerRender ? { drawerRender } : null),
    placement,
    ...sizeProp,
    title: null,
    maskClosable: Object.prototype.hasOwnProperty.call(props, 'maskClosable')
      ? props.maskClosable
      : false,
    destroyOnHidden: true,
    footer: null,
    closable: false,
    onClose,
    rootClassName: classnames(
      rootClassName,
      isMobile && style['drawer-root-mobile'],
      isMobile && fixedModeClass,
      modalRender && style['drawer-form-host'],
      drawerRender && style['drawer-host-render'],
    ),
    classNames: Object.assign({}, propsClassNames, {
      header: classnames(style['drawer-antd-header'], propsClassNames?.header),
      footer: classnames(style['drawer-antd-footer'], propsClassNames?.footer),
      body: classnames(
        style['drawer-antd-body'],
        isMobile && style['is-mobile'],
        propsClassNames?.body,
      ),
      wrapper: classnames(propsClassNames?.wrapper, mobileWrapperClass),
      mask: classnames(propsClassNames?.mask, isMobile && fixedModeClass),
    }),
    className: classnames(className, style['drawer'], style[size], {
      [style['is-mobile']]: isMobile,
    }),
    style: Object.assign(
      {},
      cssVars,
      propsStyle,
      vertical ? { '--kne-drawer-viewport-height': dimension } : null,
    ),
    styles: {
      ...propsStyles,
      body: {
        padding: 0,
        ...propsStyles?.body,
        flex: '1 1 auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...(isMobile ? { height: '100%', maxHeight: '100%' } : null),
      },
      section: {
        ...panelLayoutStyles,
        ...propsStyles?.section,
        ...propsStyles?.content,
      },
      wrapper: {
        ...propsStyles?.wrapper,
        ...(vertical
          ? { height: 'var(--kne-drawer-viewport-height, 100vh)', maxHeight: '100%' }
          : { height: '100%' }),
        ...(isMobile && !vertical
          ? { width: 'var(--kne-viewport-width, 100vw)', maxWidth: '100%' }
          : null),
        ...(isMobile && vertical
          ? { height: 'var(--kne-viewport-height, 100vh)', maxHeight: '100%' }
          : null),
      },
    },
    children: <DrawerLocaleRoot>{runChildren({})}</DrawerLocaleRoot>,
  };
};

const Drawer = withLocale(
  ({ size = 'default', placement = 'right', getContainer, open, bodyScroll = true, ...props }) => {
    const hostRef = useRef(null);
    const { isMobile, fixedModeClass, getPopupContainer, anchorRef } = useMobilePopupMount({
      ...boundaryPopupMountOptions,
      getPopupContainer: wrapCustomGetContainer(getContainer),
    });
    const getScrollElement = useScrollElement();
    useLockParentScroll(!!open, getScrollElement);

    const setAnchorRef = (node) => {
      hostRef.current = node;
      anchorRef(node);
    };

    const getDrawerContainer = resolveDrawerGetContainer({
      customGetContainer: getContainer,
      getPopupContainer,
      getHostNode: () => hostRef.current,
    });

    return (
      <>
        <span ref={setAnchorRef} className={style['drawer-host']} aria-hidden="true" />
        <AntdDrawer
          {...computedDrawerProps(
            Object.assign({}, props, {
              size,
              placement,
              isMobile,
              open,
              fixedModeClass,
              bodyScroll,
            }),
          )}
          open={open}
          getContainer={getDrawerContainer}
        />
      </>
    );
  },
);

export default Drawer;
