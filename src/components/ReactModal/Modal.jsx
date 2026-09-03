// @ts-nocheck
// Ported from https://github.com/kne-union/react-modal/blob/master/src/Modal.js
import { useEffect, useRef } from 'react';
import { App, Button, Modal as AntdModal } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { useMobilePopupMount, useScrollElement } from '@kne/responsive-utils';
import withLocale from './withLocale';
import Footer from './Footer';
import SimpleBar from './SimpleBar';
import style from './style.module.scss';

const ModalLocaleRoot = withLocale(({ children }) => children);

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

const VIEWPORT_EXAMPLE_SELECTORS = ['.example-driver-device-scroll'];

const viewportPopupMountOptions = {
  cover: 'viewport',
  exampleSelectors: VIEWPORT_EXAMPLE_SELECTORS,
};

const findParentModalMountHost = (node) => {
  if (!node || typeof node.closest !== 'function') {
    return null;
  }
  const parentRoot = node.closest('.ant-modal-root');
  if (!parentRoot) {
    return null;
  }
  return parentRoot.parentElement || (typeof document !== 'undefined' ? document.body : null);
};

export const resolveModalGetContainer = ({
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
    const nestedHost = findParentModalMountHost(from);
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
  const chrome = 48 + (hasFooter ? 58 : 0);
  const minHeight = `${Math.max(0, minBase - chrome)}px`;
  if (size === 'large') {
    return {
      width:
        typeof window !== 'undefined' ? `${Math.min(window.innerWidth - 64, 1500)}px` : '1500px',
      '--kne-modal-body-min-height': minHeight,
    };
  }
  if (size === 'small') {
    return {
      width: '600px',
      '--kne-modal-body-min-height': minHeight,
    };
  }
  return {
    width: '1000px',
    '--kne-modal-body-min-height': minHeight,
  };
};

const ModalOuter = ({
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
      className={classnames(style['modal-body-inner'], 'modal-body-inner', {
        [style['no-padding']]: effectiveNoPadding,
      })}
    >
      {children}
    </div>
  );

  const bodyClassName = classnames(style['modal-body'], 'modal-body');

  return (
    <div
      className={classnames(style['modal-outer'], 'modal-container', {
        [style['is-mobile']]: isMobile,
        [style['no-title']]: !title,
        [style['no-footer']]: footer === null && footerButtons === undefined,
        [style['no-padding']]: effectiveNoPadding,
      })}
      data-testid="react-modal"
    >
      {closable === false ? null : (
        <Button
          data-testid="react-modal-close-btn"
          className={classnames(style['modal-close'], 'modal-close')}
          type="text"
          icon={<CloseOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onClose && onClose();
          }}
        />
      )}
      {title ? (
        <div className={classnames(style['modal-title'], 'modal-title')}>{title}</div>
      ) : null}
      {bodyScroll !== false ? (
        <SimpleBar className={bodyClassName} style={{ height: 'var(--kne-modal-body-height)' }}>
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

const computedCommonProps = ({
  children,
  footer,
  footerButtons,
  className,
  size = 'default',
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
  mobileFullscreen = true,
  fixedModeClass,
  wrapClassName,
  classNames: propsClassNames,
  styles: propsStyles,
  style: propsStyle,
  modalRender,
  ...props
}) => {
  const useMobileLayout = isMobile && mobileFullscreen !== false;
  const hasFooter = !(footer === null && footerButtons === undefined);
  const sizeVars = sizeStyleVars(size, hasFooter);
  const { width, ...cssVars } = sizeVars;

  const runChildren = (options) => {
    const opts = Object.assign({}, options, { close: onClose });
    const modalPanel = (
      <ModalOuter
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
        isMobile={useMobileLayout}
        bodyScroll={bodyScroll}
      >
        {renderWithOptions(children, opts)}
      </ModalOuter>
    );

    return typeof modalRender === 'function' ? modalRender(modalPanel) : modalPanel;
  };

  return {
    ...props,
    icon: null,
    centered: !useMobileLayout,
    width: props.width ?? (useMobileLayout ? 'var(--kne-modal-viewport-width, 100vw)' : width),
    wrapClassName: classnames(
      wrapClassName,
      style['modal-wrap'],
      useMobileLayout ? style['modal-wrap-fullscreen'] : style['modal-wrap-centered'],
      useMobileLayout && fixedModeClass,
      modalRender && style['modal-form-host'],
    ),
    classNames: Object.assign({}, propsClassNames, {
      mask: classnames(
        propsClassNames?.mask,
        useMobileLayout && style['modal-mask-fullscreen'],
        useMobileLayout && fixedModeClass,
      ),
      container: classnames(
        style['modal-container'],
        useMobileLayout && style['is-mobile'],
        propsClassNames?.container,
      ),
      body: classnames(
        style['modal-antd-body'],
        useMobileLayout && style['is-mobile'],
        propsClassNames?.body,
      ),
      footer: classnames(style['modal-antd-footer'], propsClassNames?.footer),
      header: classnames(style['modal-antd-header'], propsClassNames?.header),
      content: classnames(
        style['modal-container'],
        useMobileLayout && style['is-mobile'],
        propsClassNames?.content,
      ),
    }),
    title: null,
    maskClosable: Object.prototype.hasOwnProperty.call(props, 'maskClosable')
      ? props.maskClosable
      : false,
    destroyOnHidden: true,
    footer: null,
    closable: false,
    onCancel: onClose,
    className: classnames(className, style['modal'], style[size], {
      [style['is-mobile']]: useMobileLayout,
    }),
    style: Object.assign(
      {},
      cssVars,
      propsStyle,
      useMobileLayout
        ? {
            '--kne-modal-viewport-gutter': '0px',
            maxWidth: '100%',
            width: '100%',
            height: 'var(--kne-modal-viewport-height, 100vh)',
            maxHeight: 'var(--kne-modal-viewport-height, 100vh)',
            top: 0,
            margin: 0,
            paddingBottom: 0,
          }
        : null,
    ),
    styles: {
      ...propsStyles,
      container: {
        padding: 0,
        ...propsStyles?.container,
        ...(useMobileLayout
          ? {
              borderRadius: 0,
              height: '100%',
              maxHeight: '100%',
              overflow: 'hidden',
            }
          : null),
      },
      content: {
        padding: 0,
        ...propsStyles?.content,
      },
      body: {
        padding: 0,
        ...propsStyles?.body,
        ...(useMobileLayout
          ? {
              height: '100%',
              maxHeight: '100%',
              overflow: 'hidden',
            }
          : null),
      },
    },
    children: <ModalLocaleRoot>{runChildren({})}</ModalLocaleRoot>,
  };
};

const Modal = withLocale(
  ({
    size = 'default',
    getContainer,
    open,
    mobileFullscreen = true,
    bodyScroll = true,
    ...props
  }) => {
    const hostRef = useRef(null);
    const { isMobile, fixedModeClass, getPopupContainer, anchorRef } = useMobilePopupMount({
      ...viewportPopupMountOptions,
      getPopupContainer: wrapCustomGetContainer(getContainer),
    });
    const getScrollElement = useScrollElement();
    useLockParentScroll(!!open, getScrollElement);

    const setAnchorRef = (node) => {
      hostRef.current = node;
      anchorRef(node);
    };

    const getModalContainer = resolveModalGetContainer({
      customGetContainer: getContainer,
      getPopupContainer,
      getHostNode: () => hostRef.current,
    });

    return (
      <>
        <span ref={setAnchorRef} className={style['modal-host']} aria-hidden="true" />
        <AntdModal
          {...computedCommonProps(
            Object.assign({}, props, {
              size,
              isMobile,
              open,
              fixedModeClass,
              mobileFullscreen,
              bodyScroll,
            }),
          )}
          open={open}
          getContainer={getModalContainer}
        />
      </>
    );
  },
);

export const useModal = () => {
  const { modal } = App.useApp();
  const { resolveMount, getPopupContainer } = useMobilePopupMount(viewportPopupMountOptions);
  const getScrollElement = useScrollElement();

  return (props) => {
    const anchor = typeof document !== 'undefined' ? document.activeElement : null;
    const { isMobile, fixedModeClass } = resolveMount(anchor);
    const unlock = lockParentScroll(getScrollElement);
    const api = {};
    const {
      afterClose: userAfterClose,
      getContainer: customGetContainer,
      onClose: userOnClose,
      onConfirm: userOnConfirm,
      onCancel: userOnCancel,
      ...restProps
    } = props;

    const closeModal = () => {
      api.close?.();
    };

    const { children, getContainer, afterClose, ...otherProps } = computedCommonProps({
      ...restProps,
      isMobile,
      fixedModeClass,
      onClose: () => {
        userOnClose?.();
        closeModal();
      },
      onCancel: (...args) => {
        userOnCancel?.(...args);
        closeModal();
      },
      onConfirm: async (...args) => {
        const res = await Promise.resolve(userOnConfirm?.(...args));
        if (res !== false) {
          closeModal();
        }
        return res;
      },
      afterClose: (...args) => {
        unlock();
        userAfterClose?.(...args);
      },
    });
    const { destroy } = modal.info({
      ...otherProps,
      afterClose,
      content: children,
      getContainer: resolveModalGetContainer({
        customGetContainer: customGetContainer ?? getContainer,
        getPopupContainer,
        getHostNode: () => anchor,
      }),
    });
    api.close = destroy;
    return api;
  };
};

export default Modal;
