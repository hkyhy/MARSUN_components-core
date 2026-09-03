// @ts-nocheck
// Ported from https://github.com/kne-union/react-modal/blob/master/src/Footer.js
import classnames from 'classnames';
import ButtonGroupModule from '@kne/button-group';
import { useIntl } from './intlStub';
import style from './style.module.scss';

// CJS/ESM interop：vitest/node 下 default 可能是 { default: Component }
const ButtonGroup = ButtonGroupModule?.default ?? ButtonGroupModule;

const Footer = ({
  footer,
  footerButtons,
  onConfirm,
  onCancel,
  cancelText,
  confirmText,
  onClose,
  targetProps,
  isMobile,
}) => {
  const { formatMessage } = useIntl();

  const defaultButtons = [
    {
      children: cancelText || formatMessage({ id: 'Cancel' }),
      onClick: onCancel,
    },
    {
      type: 'primary',
      children: confirmText || formatMessage({ id: 'Confirm' }),
      onClick: onConfirm,
    },
  ];

  const rawList = footerButtons === undefined ? defaultButtons : footerButtons;

  const list = (Array.isArray(rawList) ? rawList : [])
    .filter((item) => {
      if (typeof item?.display === 'function') {
        return item.display();
      }
      return item?.display !== false;
    })
    .map(({ ButtonComponent, onClick, autoClose = true, display, ...props }) => ({
      ...props,
      buttonComponent: ButtonComponent,
      onClick: async (...args) => {
        const res = await Promise.resolve(onClick && onClick(...args, targetProps));
        autoClose && res !== false && onClose && onClose();
        return res;
      },
    }));

  const showButtons =
    !(Array.isArray(footerButtons) && footerButtons.length === 0) && list.length > 0;
  const embeddedFooterOnly =
    Array.isArray(footerButtons) && footerButtons.length === 0 && footer != null;
  const showFooterSlot = !isMobile || footer;

  if (!showFooterSlot && !showButtons) {
    return null;
  }

  return (
    <div
      className={classnames(style['modal-footer'], 'modal-footer', {
        [style['is-mobile']]: isMobile,
        [style['is-embedded-footer']]: embeddedFooterOnly,
      })}
    >
      {showFooterSlot ? <div className={style['modal-footer-extra']}>{footer}</div> : null}
      {showButtons ? (
        <div className={style['modal-footer-actions']}>
          <ButtonGroup list={list} showLength={list.length} place={isMobile ? 'center' : 'end'} />
        </div>
      ) : null}
    </div>
  );
};

export default Footer;
