// @ts-nocheck
import { useFormContext } from '@kne/react-form-antd';
import { useClickAway } from 'ahooks';
import { Popover } from 'antd';
import classnames from 'classnames';
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { ErrorTipProps } from './types';
import style from './style.module.scss';

type FieldState = {
  name?: string;
  groupName?: string;
  groupIndex?: number;
  label?: ReactNode;
  id?: string;
};

const compileErrMsg = (msg: unknown, label: unknown) => {
  if (typeof msg !== 'string') return String(msg ?? '');
  return msg.replace(/%s/g, String(label ?? ''));
};

const useErrorMsg = ({
  name,
  groupName,
  groupIndex,
}: {
  name: string;
  groupName?: string;
  groupIndex?: number;
}) => {
  const ctx = (useFormContext() || {}) as {
    emitter?: { addListener: (ev: string, fn: (p: unknown) => void) => { remove?: () => void } };
    formState?: Record<string, FieldState>;
  };
  const { emitter, formState } = ctx;
  const targetFieldInfo = useRef({ name, groupName, groupIndex });
  targetFieldInfo.current = { name, groupName, groupIndex };
  const formStateRef = useRef(formState);
  formStateRef.current = formState;
  const [currentError, setCurrentError] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!emitter?.addListener) return undefined;
    const target = emitter.addListener('form-field-validate-complete', (payload: unknown) => {
      const { id, validate } = (payload || {}) as {
        id?: string;
        validate?: { status?: number | string; msg?: string };
      };
      const field = id ? formStateRef.current?.[id] : undefined;
      if (!field) return;
      const currentField = targetFieldInfo.current;
      if (
        field.name === currentField.name &&
        (!currentField.groupName ||
          (field.groupName === currentField.groupName &&
            field.groupIndex === currentField.groupIndex))
      ) {
        const failed =
          validate?.status === 2 || validate?.status === 'FAIL' || validate?.status === 'ERROR';
        setCurrentError(
          failed
            ? Object.assign({}, validate, {
                label: field.label,
                errMsg: compileErrMsg(validate?.msg, field.label),
              })
            : null,
        );
      }
    });
    return () => {
      target?.remove?.();
    };
  }, [emitter]);

  return currentError;
};

/**
 * 校验失败悬停提示；外点关闭用 ahooks useClickAway。
 * Adapted from kne-union/components-core FormInfo/ErrorTip.
 */
const ErrorTip = ({
  name,
  groupName,
  overlayClassName,
  errorRender = () => null,
  groupIndex,
  children,
}: ErrorTipProps) => {
  const currentError = useErrorMsg({ name, groupName, groupIndex });
  const [isHover, setIsHover] = useState(false);
  const open = !!(currentError && isHover);
  const errorContent =
    open && errorRender(Object.assign({}, currentError, { closeHover: () => setIsHover(false) }));

  const popoverChildrenRef = useRef<HTMLDivElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useClickAway(
    () => setIsHover(false),
    [() => popoverChildrenRef.current, () => popoverContentRef.current],
  );

  useLayoutEffect(() => {
    const root = popoverChildrenRef.current;
    if (!root) return undefined;
    const callback = () => {
      const target = root.querySelector('.react-form__field-component');
      if (target) setWidth((target as HTMLElement).clientWidth);
    };
    callback();
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(callback) : null;
    resizeObserver?.observe(root);
    const mutationObserver =
      typeof MutationObserver !== 'undefined' ? new MutationObserver(callback) : null;
    mutationObserver?.observe(root, { subtree: true, childList: true });
    return () => {
      mutationObserver?.disconnect();
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <Popover
      open={open}
      content={
        <div
          ref={popoverContentRef}
          style={width ? { width } : undefined}
          className={classnames('marsun-form-info-error-tip', style['marsun-form-info-error-tip'])}
        >
          {errorContent}
        </div>
      }
      overlayClassName={overlayClassName}
      placement="bottom"
      arrow={false}
    >
      <div ref={popoverChildrenRef} onMouseEnter={() => setIsHover(true)}>
        {children}
      </div>
    </Popover>
  );
};

export default ErrorTip;
