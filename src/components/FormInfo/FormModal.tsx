// @ts-nocheck
import { App, Flex, Modal } from 'antd';
import { CancelButton, SubmitButton } from '@kne/react-form-antd';
import classnames from 'classnames';
import type { ReactNode } from 'react';
import Form from './Form';
import { buildFormOverlayProps } from './buildFormOverlayProps';
import type { FormModalProps } from './types';
import style from './style.module.scss';

export function resolveFormModalWidth(width?: string | number, size?: string): string | number {
  if (width != null && width !== '') return width;
  if (size === 'large') return 800;
  return 520;
}

type FormModalBodyProps = {
  formProps?: FormModalProps['formProps'];
  autoClose?: boolean;
  children?: FormModalProps['children'];
  close?: () => void;
  okText?: FormModalProps['okText'];
  saveText?: FormModalProps['saveText'];
  cancelText?: FormModalProps['cancelText'];
  footerButtons?: FormModalProps['footerButtons'];
  okButtonProps?: FormModalProps['okButtonProps'];
  cancelButtonProps?: FormModalProps['cancelButtonProps'];
};

function FormModalBody({
  formProps = {},
  autoClose = true,
  children,
  close,
  okText,
  saveText,
  cancelText,
  footerButtons,
  okButtonProps,
  cancelButtonProps,
}: FormModalBodyProps) {
  const resolvedFormProps = typeof formProps === 'function' ? formProps({ close }) : formProps;
  const { onSubmit, ..._formProps } = Object.assign({}, resolvedFormProps) as {
    onSubmit?: (
      data: Record<string, unknown>,
      ctx: { close?: () => void },
      ...args: unknown[]
    ) => unknown;
    [key: string]: unknown;
  };

  const defaultButtons = [
    {
      children: cancelText || '取消',
      ButtonComponent: CancelButton,
      onClick: () => close?.(),
      ...(cancelButtonProps || {}),
    },
    {
      type: 'primary' as const,
      children: okText ?? saveText ?? '提交',
      ButtonComponent: SubmitButton,
      autoClose: false,
      ...(okButtonProps || {}),
    },
  ];

  const buttons = (footerButtons as typeof defaultButtons | undefined) || defaultButtons;

  const footer = (
    <Flex
      justify="flex-end"
      gap={8}
      className={classnames(
        style['marsun-form-info-modal-footer'],
        'marsun-form-info-modal-footer',
      )}
    >
      {buttons.map((item, idx) => {
        const {
          ButtonComponent,
          onClick,
          autoClose: btnAutoClose = true,
          children: btnChildren,
          type,
          ...btnRest
        } = item as {
          ButtonComponent?: React.ComponentType<Record<string, unknown>>;
          onClick?: (...args: unknown[]) => unknown;
          autoClose?: boolean;
          children?: ReactNode;
          type?: string;
          [key: string]: unknown;
        };
        const Comp = ButtonComponent || SubmitButton;
        return (
          <Comp
            key={idx}
            type={type}
            {...btnRest}
            onClick={async (...args: unknown[]) => {
              const res = await Promise.resolve(onClick?.(...args));
              if (btnAutoClose && res !== false) close?.();
              return res;
            }}
          >
            {btnChildren}
          </Comp>
        );
      })}
    </Flex>
  );

  return (
    <Form
      {..._formProps}
      onSubmit={async (data: Record<string, unknown>, ...args: unknown[]) => {
        const res = onSubmit && (await onSubmit(data, { close }, ...args));
        if (res !== false) {
          autoClose && close?.();
        }
        return res;
      }}
    >
      <div
        className={classnames(style['marsun-form-info-modal-body'], 'marsun-form-info-modal-body')}
      >
        {typeof children === 'function' ? children({ close }) : children}
      </div>
      {footer}
    </Form>
  );
}

const FormModal = (props: FormModalProps) => {
  const {
    open,
    onCancel,
    onClose,
    renderModal,
    width,
    size,
    title,
    zIndex,
    className,
    destroyOnHidden = true,
    children,
    formProps,
    autoClose = true,
    okText,
    saveText,
    cancelText,
    footerButtons,
    okButtonProps,
    cancelButtonProps,
    bodyScroll: _bodyScroll,
    footer: _footer,
    ..._rest
  } = props;
  void _bodyScroll;
  void _footer;
  void _rest;

  const close = onCancel ?? onClose;

  if (typeof renderModal === 'function') {
    const overlayProps = buildFormOverlayProps(
      { ...props, onClose: close, onCancel: close },
      { close },
    );
    return renderModal({
      ...overlayProps,
      open: !!open,
      className: classnames(
        style['marsun-form-info-modal'],
        'marsun-form-info-modal',
        overlayProps.className,
      ),
      destroyOnHidden: true,
    });
  }

  return (
    <Modal
      open={!!open}
      title={title}
      onCancel={() => close?.()}
      width={resolveFormModalWidth(width, size)}
      destroyOnHidden={destroyOnHidden}
      zIndex={zIndex as number | undefined}
      footer={null}
      mask={{ closable: false }}
      className={classnames(style['marsun-form-info-modal'], 'marsun-form-info-modal', className)}
    >
      <FormModalBody
        formProps={formProps}
        autoClose={autoClose}
        close={close}
        okText={okText}
        saveText={saveText}
        cancelText={cancelText}
        footerButtons={footerButtons}
        okButtonProps={okButtonProps}
        cancelButtonProps={cancelButtonProps}
      >
        {children}
      </FormModalBody>
    </Modal>
  );
};

export default FormModal;

export const useFormModal = () => {
  const { modal } = App.useApp();
  return (props: FormModalProps = {}) => {
    const api: { close?: () => void } = {};
    const destroyClose = () => api.close?.();
    const userClose = props.onClose || props.onCancel;
    const close = () => {
      userClose?.();
      destroyClose();
    };

    const { destroy } = modal.info({
      title: props.title,
      icon: null,
      width: resolveFormModalWidth(props.width, props.size),
      className: classnames(
        style['marsun-form-info-modal'],
        'marsun-form-info-modal',
        props.className,
      ),
      footer: null,
      closable: true,
      mask: { closable: false },
      destroyOnHidden: true,
      zIndex: props.zIndex as number | undefined,
      onCancel: close,
      content: (
        <FormModalBody
          formProps={props.formProps}
          autoClose={props.autoClose !== false}
          close={close}
          okText={props.okText}
          saveText={props.saveText}
          cancelText={props.cancelText}
          footerButtons={props.footerButtons}
          okButtonProps={props.okButtonProps}
          cancelButtonProps={props.cancelButtonProps}
        >
          {props.children}
        </FormModalBody>
      ),
    });
    api.close = destroy;
    return { close: destroy };
  };
};
