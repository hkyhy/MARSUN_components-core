// @ts-nocheck
// Ported from https://github.com/kne-union/react-modal/blob/master/src/useConfirmModal.js
import { App } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from '@ant-design/icons';
import classnames from 'classnames';
import { useMobilePopupMount, useScrollElement } from '@kne/responsive-utils';
import withLocale from './withLocale';
import { lockParentScroll, resolveModalGetContainer } from './Modal';
import modalStyle from './style.module.scss';
import confirmStyle from './confirmModal.module.scss';

const ConfirmLocaleRoot = withLocale(({ children }) => children);

const VIEWPORT_EXAMPLE_SELECTORS = ['.example-driver-device-scroll'];

const viewportPopupMountOptions = {
  cover: 'viewport',
  exampleSelectors: VIEWPORT_EXAMPLE_SELECTORS,
};

const ICON_BY_TYPE = {
  info: InfoCircleFilled,
  confirm: ExclamationCircleFilled,
  warning: ExclamationCircleFilled,
  error: CloseCircleFilled,
  success: CheckCircleFilled,
};

const getIconKind = (type, confirmType) => (type === 'confirm' ? confirmType : type);

const shouldShowDefaultIcon = ({ type, danger, icon }) => {
  if (icon === false || icon === null) {
    return false;
  }
  if (type === 'confirm') {
    return !!danger;
  }
  return ['info', 'success', 'warning', 'error'].includes(type);
};

const getConfirmIconNode = ({ type, confirmType = 'info', danger, icon }) => {
  if (icon) {
    return icon;
  }
  if (!shouldShowDefaultIcon({ type, danger, icon })) {
    return null;
  }
  const kind = getIconKind(type, confirmType);
  const IconComponent = ICON_BY_TYPE[kind] || ICON_BY_TYPE.info;
  return (
    <IconComponent
      className={classnames(confirmStyle['title-icon'], confirmStyle[`title-icon-${kind}`])}
    />
  );
};

const buildConfirmContent = ({ type, confirmType, title, message, danger, icon, isMobile }) => {
  const iconNode = getConfirmIconNode({ type, confirmType, danger, icon });
  const mobileClass = isMobile ? confirmStyle['is-mobile-block'] : null;

  return {
    title: title ? (
      <div
        className={classnames(confirmStyle.titleRow, mobileClass)}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {iconNode ? <span className={confirmStyle.titleIcon}>{iconNode}</span> : null}
        <div className={confirmStyle.titleText}>{title}</div>
      </div>
    ) : null,
    content: (
      <div
        className={classnames(confirmStyle.contentRow, mobileClass, {
          [confirmStyle['has-title']]: title,
          [confirmStyle['has-icon']]: !!iconNode && title,
        })}
      >
        {!title && iconNode ? <span className={confirmStyle.titleIcon}>{iconNode}</span> : null}
        <div className={confirmStyle.contentText}>{message}</div>
      </div>
    ),
  };
};

const mapConfirmProps = (
  props,
  { isMobile, fixedModeClass, getPopupContainer, anchor, unlock, userAfterClose },
) => {
  const {
    type = 'confirm',
    icon,
    title,
    danger,
    wrapClassName,
    message,
    confirmType = 'info',
    getContainer: customGetContainer,
    onConfirm,
    onCancel,
    confirmText,
    cancelText,
    afterClose,
    zIndex,
    ...otherProps
  } = {
    maskClosable: false,
    ...props,
  };

  const { title: confirmTitle, content } = buildConfirmContent({
    type,
    confirmType,
    title,
    message,
    danger,
    icon,
    isMobile,
  });

  return {
    modalMethod: type,
    config: {
      ...otherProps,
      zIndex: zIndex ?? 1100,
      okText: confirmText ?? otherProps.okText,
      cancelText: cancelText ?? otherProps.cancelText,
      onOk: onConfirm ?? otherProps.onOk,
      onCancel: onCancel ?? otherProps.onCancel,
      getContainer: resolveModalGetContainer({
        customGetContainer,
        getPopupContainer,
        getHostNode: () => anchor,
      }),
      centered: true,
      afterClose: (...args) => {
        unlock();
        userAfterClose && userAfterClose(...args);
        afterClose && afterClose(...args);
      },
      icon: null,
      classNames: {
        mask: classnames(
          isMobile && modalStyle['modal-mask-fullscreen'],
          isMobile && fixedModeClass,
          otherProps.classNames?.mask,
        ),
      },
      wrapClassName: classnames(
        modalStyle['modal-wrap'],
        modalStyle['modal-wrap-centered'],
        confirmStyle['confirm-modal-wrap'],
        wrapClassName,
        {
          [confirmStyle['is-danger']]: danger,
          [confirmStyle['is-mobile']]: isMobile,
          [fixedModeClass]: isMobile,
        },
      ),
      title: confirmTitle ? <ConfirmLocaleRoot>{confirmTitle}</ConfirmLocaleRoot> : null,
      content: <ConfirmLocaleRoot>{content}</ConfirmLocaleRoot>,
    },
  };
};

export const useConfirmModal = () => {
  const { modal } = App.useApp();
  const { resolveMount, getPopupContainer } = useMobilePopupMount(viewportPopupMountOptions);
  const getScrollElement = useScrollElement();

  return (props) => {
    const anchor = typeof document !== 'undefined' ? document.activeElement : null;
    const { isMobile, fixedModeClass } = resolveMount(anchor);
    const unlock = lockParentScroll(getScrollElement);
    const api = {};
    const { afterClose: userAfterClose, ...restProps } = props;
    const { modalMethod, config } = mapConfirmProps(
      {
        ...restProps,
        onClose: () => api.close(),
      },
      {
        isMobile,
        fixedModeClass,
        getPopupContainer,
        anchor,
        unlock,
        userAfterClose,
      },
    );

    if (typeof modal[modalMethod] === 'function') {
      const { destroy } = modal[modalMethod](config);
      api.close = destroy;
    } else {
      unlock();
      api.close = () => {};
    }

    return api;
  };
};

export default useConfirmModal;
