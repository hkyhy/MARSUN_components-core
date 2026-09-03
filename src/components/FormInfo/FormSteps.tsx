// @ts-nocheck
import { useIsMobile } from '@kne/responsive-utils';
import { useControllableValue } from 'ahooks';
import { Flex, Steps as AntSteps } from 'antd';
import classnames from 'classnames';
import omit from 'lodash/omit';
import { useRef, type ReactNode } from 'react';
import Form from './Form';
import EmbedSteps from './Steps';
import type { FormStepsProps } from './types';
import style from './style.module.scss';

const FormSteps = (p: FormStepsProps) => {
  const { className, stepsClassName, autoStep, onComplete, children, ...stepProps } = Object.assign(
    {
      autoStep: true,
      defaultCurrent: 0,
      items: [] as NonNullable<FormStepsProps['items']>,
      onComplete: () => {},
    },
    p,
  );

  const isMobile = useIsMobile();
  const [currentStep, onStepChange] = useControllableValue(stepProps, {
    valuePropName: 'current',
    defaultValuePropName: 'defaultCurrent',
  }) as [number, (n: number) => void];

  const stepCacheRef = useRef<Array<{ formData?: unknown; submitData?: unknown }>>([]);
  const items = stepProps.items || [];
  const isLastStep = currentStep === items.length - 1;

  const currentFormProps = Object.assign({}, items[currentStep]?.formProps, {
    data: Object.assign(
      {},
      (items[currentStep]?.formProps as { data?: Record<string, unknown> })?.data,
      stepCacheRef.current[currentStep]?.formData as Record<string, unknown>,
    ),
  });

  const stepItems = items.map((item) => {
    const currentItem = omit(item, ['formProps']);
    if (typeof currentItem.children === 'function') {
      return Object.assign({}, currentItem, {
        children: (currentItem.children as Function)({
          isLastStep,
          currentStep,
          onStepChange,
          getStepCache: () => stepCacheRef.current,
        }),
      });
    }
    return currentItem;
  });

  const stepsDirection = isMobile ? 'vertical' : stepProps.direction || stepProps.orientation;
  const isVerticalSteps = stepsDirection === 'vertical';

  const inner = (
    <Flex className={className} vertical={!isVerticalSteps || isMobile} gap={24}>
      <AntSteps
        {...omit(stepProps, ['current', 'defaultCurrent', 'onChange', 'direction', 'orientation'])}
        direction={stepsDirection as 'horizontal' | 'vertical'}
        className={classnames(
          'marsun-form-info-steps',
          stepsClassName,
          style['marsun-form-info-steps'],
          {
            [style['marsun-form-info-steps-vertical']]: isVerticalSteps,
          },
        )}
        items={stepItems.map((item) => ({ title: item.title }))}
        current={currentStep}
      />
      <div className={style['marsun-form-info-steps-form-inner']}>
        {stepItems[currentStep]?.children as ReactNode}
      </div>
    </Flex>
  );

  return (
    <Form
      {...Object.assign({}, currentFormProps, {
        onSubmit: async (data: Record<string, unknown>, ...args: unknown[]) => {
          if (!stepCacheRef.current[currentStep]) {
            stepCacheRef.current[currentStep] = {};
          }
          stepCacheRef.current[currentStep].formData = data;
          const formOnSubmit = (
            currentFormProps as {
              onSubmit?: (
                data: Record<string, unknown>,
                ctx: Record<string, unknown>,
                ...args: unknown[]
              ) => unknown;
            }
          ).onSubmit;
          const res = await formOnSubmit?.(
            data,
            {
              currentStep,
              onStepChange,
              stepCache: stepCacheRef.current,
              getStepCache: () => stepCacheRef.current,
              isLastStep,
            },
            ...args,
          );
          stepCacheRef.current[currentStep].submitData = res;

          if (autoStep && res !== false && !isLastStep) {
            onStepChange(currentStep + 1);
            return res;
          }
          if (autoStep && res !== false) {
            await onComplete?.(stepCacheRef.current);
            return res;
          }
          return res;
        },
      })}
      key={currentStep}
    >
      {typeof children === 'function'
        ? children({
            children: inner,
            isLastStep,
            currentStep,
            onStepChange,
            getStepCache: () => stepCacheRef.current,
          })
        : inner}
    </Form>
  );
};

FormSteps.Embed = EmbedSteps;

export default FormSteps;
