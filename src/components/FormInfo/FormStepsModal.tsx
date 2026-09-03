// @ts-nocheck
import { SubmitButton } from '@kne/react-form-antd';
import { Flex } from 'antd';
import classnames from 'classnames';
import merge from 'lodash/merge';
import { ReactModal } from '@/components/ReactModal';
import FormSteps from './FormSteps';
import { useFormModal } from './FormModal';
import type { FormStepsModalProps } from './types';
import withLocale, { useFormInfoLocale } from './withLocale';
import style from './style.module.scss';

/**
 * 步骤弹窗：ReactModal + FormSteps；页内 Submit 驱动下一步/完成。
 * destroyOnHidden。
 */
const FormStepsModal = withLocale((p: FormStepsModalProps) => {
  const { formatMessage } = useFormInfoLocale();
  const { modalProps, completeText, nextText, className, ...others } = merge(
    {},
    {
      autoStep: true,
      modalProps: { autoClose: true },
      completeText: formatMessage({ id: 'complete' }),
      nextText: formatMessage({ id: 'next' }),
    },
    p,
  );

  const close = modalProps.onCancel ?? modalProps.onClose;

  const stepsChildren = (
    <FormSteps
      {...others}
      className={classnames(className, style['marsun-form-info-steps-modal'])}
      onComplete={async (data) => {
        const res = await others.onComplete?.(data);
        if (modalProps.autoClose !== false && res !== false) {
          close?.();
        }
        return res;
      }}
    >
      {({ children, isLastStep }) => (
        <>
          {children}
          <Flex justify="flex-end" gap={8} style={{ marginTop: 16 }}>
            <SubmitButton type="primary">{isLastStep ? completeText : nextText}</SubmitButton>
          </Flex>
        </>
      )}
    </FormSteps>
  );

  const hostProps = {
    open: !!modalProps.open,
    title: modalProps.title,
    width: modalProps.width,
    size: modalProps.size,
    onClose: close,
    onCancel: close,
    destroyOnHidden: true as const,
    footerButtons: [
      {
        children: modalProps.cancelText || formatMessage({ id: 'cancel' }),
        onClick: () => close?.(),
      },
    ],
    className: classnames(
      'marsun-form-info-modal',
      style['marsun-form-info-modal'],
      modalProps.className,
    ),
    children: stepsChildren,
  };

  if (typeof modalProps.renderModal === 'function') {
    return modalProps.renderModal(hostProps);
  }

  return <ReactModal {...hostProps} />;
});

export default FormStepsModal;

/** 命令式打开步骤弹窗（经 useFormModal 挂 ReactModal） */
export const useFormStepModal = () => {
  const formModal = useFormModal();
  return (props: FormStepsModalProps = {}) => {
    const { modalProps, completeText, nextText, className, ...others } = merge(
      {},
      {
        autoStep: true,
        modalProps: { autoClose: true },
        completeText: '完成',
        nextText: '下一步',
      },
      props,
    );

    return formModal({
      ...modalProps,
      okText: completeText,
      children: (
        <FormSteps
          {...others}
          className={classnames(className, style['marsun-form-info-steps-modal'])}
          onComplete={async (data) => {
            const res = await others.onComplete?.(data);
            return res;
          }}
        >
          {({ children, isLastStep }) => (
            <>
              {children}
              <Flex justify="flex-end" gap={8} style={{ marginTop: 16 }}>
                <SubmitButton type="primary">{isLastStep ? completeText : nextText}</SubmitButton>
              </Flex>
            </>
          )}
        </FormSteps>
      ),
    });
  };
};
