// @ts-nocheck
import { useFormContext } from '@kne/react-form-antd';
import { useIsMobile } from '@kne/responsive-utils';
import { useControllableValue } from 'ahooks';
import { Button, Flex, Steps as AntSteps } from 'antd';
import classnames from 'classnames';
import omit from 'lodash/omit';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import InfoPage from '@/components/InfoPage';
import FormInfo from './FormInfo';
import { markNestBlock } from './nestBlock';
import type { StepsItem, StepsProps } from './types';
import withLocale, { useFormInfoLocale } from './withLocale';
import style from './style.module.scss';

const collectFieldNames = (item: StepsItem = {}) => {
  if (Array.isArray(item.fieldNames) && item.fieldNames.length) {
    return item.fieldNames.filter(Boolean);
  }
  return (item.list || [])
    .map((field) =>
      field && typeof field === 'object' && 'props' in field
        ? (field as React.ReactElement).props?.name
        : undefined,
    )
    .filter(Boolean) as string[];
};

/** 校验指定字段，全部 PASS 才返回 true */
export const validateFieldsByName = (
  openApi:
    | {
        validateField?: (p: { name: string }) => void;
        emitter?: {
          addListener: (ev: string, fn: (p: unknown) => void) => { remove?: () => void };
        };
        getField?: (p: { name: string }) => {
          id?: string;
          isPass?: boolean;
          validate?: { status?: string };
        };
      }
    | null
    | undefined,
  names: string[] = [],
) => {
  if (!openApi?.validateField || !openApi?.emitter || !names.length) {
    return Promise.resolve(true);
  }

  return Promise.all(
    names.map(
      (name) =>
        new Promise<boolean>((resolve) => {
          const field = openApi.getField?.({ name });
          if (!field?.id) {
            resolve(true);
            return;
          }

          let settled = false;
          let subscription: { remove?: () => void } | undefined;
          const finish = (pass: boolean) => {
            if (settled) return;
            settled = true;
            subscription?.remove?.();
            clearTimeout(timer);
            resolve(!!pass);
          };

          subscription = openApi.emitter!.addListener(
            `form-field:validate:complete:${field.id}`,
            (payload: unknown) => {
              const { validate } = (payload || {}) as { validate?: { status?: string } };
              finish(validate?.status === 'PASS');
            },
          );

          openApi.validateField!({ name });

          const timer = setTimeout(() => {
            const latest = openApi.getField?.({ name });
            finish(latest?.isPass === true || latest?.validate?.status === 'PASS');
          }, 2000);
        }),
    ),
  ).then((results) => results.every(Boolean));
};

const findFirstErrorStepIndex = (
  items: StepsItem[],
  errors: Array<{ name?: string }> | undefined,
) => {
  const errorNames = new Set((errors || []).map((item) => item?.name).filter(Boolean));
  if (!errorNames.size) return -1;
  return items.findIndex((step) => collectFieldNames(step).some((name) => errorNames.has(name)));
};

/**
 * 嵌入父级 Form 的分步区域（不自建 Form）。
 */
const Steps = withLocale((p: StepsProps) => {
  const { formatMessage } = useFormInfoLocale();
  const {
    className,
    stepsClassName,
    title,
    subtitle,
    bordered,
    items = [],
    showActions = true,
    prevText,
    nextText,
    prevIcon,
    nextIcon,
    ...stepProps
  } = Object.assign(
    {
      defaultCurrent: 0,
      prevText: formatMessage({ id: 'prev' }),
      nextText: formatMessage({ id: 'next' }),
      prevIcon: null as ReactNode,
      nextIcon: null as ReactNode,
    },
    p,
  );

  const isMobile = useIsMobile();
  const { openApi } = (useFormContext() || {}) as {
    openApi?: Parameters<typeof validateFieldsByName>[0];
  };
  const rootRef = useRef<HTMLDivElement>(null);
  const [nextLoading, setNextLoading] = useState(false);
  const [currentStep, onStepChange] = useControllableValue(stepProps, {
    valuePropName: 'current',
    defaultValuePropName: 'defaultCurrent',
  }) as [number, (n: number) => void];

  const stepsDirection = isMobile ? 'vertical' : stepProps.direction || stepProps.orientation;
  const isVerticalSteps = stepsDirection === 'vertical';
  const isLastStep = currentStep >= items.length - 1;

  const jumpToErrorStep = useCallback(
    (errors: Array<{ name?: string }> | undefined) => {
      const index = findFirstErrorStepIndex(items, errors);
      if (index < 0) return;
      onStepChange(index);
      requestAnimationFrame(() => {
        rootRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
      });
    },
    [items, onStepChange],
  );

  useEffect(() => {
    const emitter = openApi?.emitter as
      | { addListener: (ev: string, fn: (p: unknown) => void) => { remove?: () => void } }
      | undefined;
    if (!emitter?.addListener) return undefined;

    const onSubmitError = (errors: unknown) => jumpToErrorStep(errors as Array<{ name?: string }>);
    const onSubmitComplete = (payload: unknown) => {
      const { isPass, errors } = (payload || {}) as {
        isPass?: boolean;
        errors?: Array<{ name?: string }>;
      };
      if (!isPass) jumpToErrorStep(errors);
    };
    const onReset = () => onStepChange(0);

    const errorSub = emitter.addListener('form:submit:error', onSubmitError);
    const completeSub = emitter.addListener('form:submit:complete', onSubmitComplete);
    const resetSub = emitter.addListener('form:reset', onReset);
    return () => {
      errorSub?.remove?.();
      completeSub?.remove?.();
      resetSub?.remove?.();
    };
  }, [openApi, jumpToErrorStep, onStepChange]);

  const handleNext = useCallback(async () => {
    if (nextLoading || isLastStep) return;
    setNextLoading(true);
    try {
      const pass = await validateFieldsByName(openApi, collectFieldNames(items[currentStep]));
      if (pass) onStepChange(Math.min(items.length - 1, currentStep + 1));
    } finally {
      setNextLoading(false);
    }
  }, [currentStep, isLastStep, items, nextLoading, onStepChange, openApi]);

  const handlePrev = useCallback(() => {
    onStepChange(Math.max(0, currentStep - 1));
  }, [currentStep, onStepChange]);

  if (!items.length) return null;

  return (
    <div ref={rootRef} className={classnames(className, style['marsun-form-info-steps-embed'])}>
      <InfoPage.Part title={title} subtitle={subtitle} bordered={bordered}>
        <Flex vertical gap={24}>
          <AntSteps
            {...omit(stepProps, [
              'current',
              'defaultCurrent',
              'onChange',
              'direction',
              'orientation',
              'items',
            ])}
            current={currentStep}
            direction={stepsDirection as 'horizontal' | 'vertical'}
            className={classnames(
              'marsun-form-info-steps',
              stepsClassName,
              style['marsun-form-info-steps'],
              {
                [style['marsun-form-info-steps-vertical']]: isVerticalSteps,
              },
            )}
            items={items.map((item, index) => ({
              title: item.title || formatMessage({ id: 'untitledStep' }, { index: index + 1 }),
            }))}
          />

          {items.map((item, index) => (
            <div
              key={item.key || item.id || index}
              className={style['marsun-form-info-steps-embed-panel']}
              style={index === currentStep ? undefined : { display: 'none' }}
              aria-hidden={index !== currentStep}
            >
              {item.children != null ? (
                item.children
              ) : (
                <FormInfo column={item.column} gap={item.gap} list={item.list || []} />
              )}
            </div>
          ))}

          {showActions ? (
            <Flex
              className={style['marsun-form-info-steps-actions']}
              justify="space-between"
              align="center"
              gap={8}
              wrap="wrap"
            >
              <div className={style['marsun-form-info-steps-actions-side']}>
                {currentStep > 0 ? (
                  <Button type="link" size="small" icon={prevIcon} onClick={handlePrev}>
                    {prevText}
                  </Button>
                ) : null}
              </div>
              <div className={style['marsun-form-info-steps-actions-side']}>
                {!isLastStep ? (
                  <Button
                    type="link"
                    size="small"
                    icon={nextIcon}
                    iconPosition="end"
                    loading={nextLoading}
                    onClick={handleNext}
                  >
                    {nextText}
                  </Button>
                ) : null}
              </div>
            </Flex>
          ) : null}
        </Flex>
      </InfoPage.Part>
    </div>
  );
});

export default markNestBlock(Steps);
