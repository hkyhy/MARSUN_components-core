import * as ReactFormAntd from '@kne/react-form-antd';
import { Input } from 'antd';
import classNames from 'classnames';
import type { ComponentType, FC, ReactNode } from 'react';
import { useRef } from 'react';
import { insertVarTokenAt, type VariableMentionItem } from '@/components/Editor/variableMention';
import { VariablePicker } from '@/components/Editor/VariablePicker';
import styles from './style.module.scss';

export type VariableMentionFieldProps = {
  name: string;
  label?: ReactNode;
  labelTips?: ReactNode | ((props: VariableMentionFieldProps) => ReactNode);
  rule?: string;
  disabled?: boolean;
  placeholder?: string;
  enableVariableMention?: boolean;
  variables?: VariableMentionItem[];
  catalogError?: string;
  className?: string;
  size?: 'small' | 'middle' | 'large';
  [key: string]: unknown;
};

type FieldRenderProps = {
  value?: string;
  onChange?: (v: string) => void;
  onBlur?: (...args: unknown[]) => void;
  disabled?: boolean;
  id?: string;
  size?: 'small' | 'middle' | 'large';
  placeholder?: string;
  className?: string;
  variables?: VariableMentionItem[];
  catalogError?: string;
};

type KneHooks = {
  useDecorator: (
    opts: Record<string, unknown>,
  ) => (Comp: ComponentType<FieldRenderProps>) => ReactNode;
};

/**
 * 标题变量：Input +「插入变量」按钮（明文 {{key}}，可手改；无 `/` 触发）。
 * 须作为稳定组件类型交给 useDecorator（禁内联函数，否则每键 remount 丢焦）。
 */
const VariableMentionControl: FC<FieldRenderProps> = ({
  value = '',
  onChange,
  onBlur,
  disabled,
  variables,
  catalogError,
  placeholder,
  className,
  id,
  size = 'middle',
}) => {
  const caretRef = useRef(String(value || '').length);
  const rootRef = useRef<HTMLDivElement>(null);

  const pick = (key: string) => {
    const next = insertVarTokenAt(String(value || ''), key, caretRef.current);
    onChange?.(next);
    caretRef.current = caretRef.current + `{{${key}}}`.length;
  };

  return (
    <div ref={rootRef} className={styles['var-mention-wrap']}>
      <Input
        id={id}
        size={size}
        value={value}
        disabled={disabled}
        placeholder={placeholder || '点右侧「插入变量」，或手打 {{key}}'}
        className={classNames('marsun-var-mention-input', styles['var-mention-input'], className)}
        onBlur={onBlur}
        onChange={(e) => {
          const next = e.target.value;
          caretRef.current = e.target.selectionStart ?? next.length;
          onChange?.(next);
        }}
        onSelect={(e) => {
          const t = e.target as HTMLInputElement;
          caretRef.current = t.selectionStart ?? -1;
        }}
        onClick={(e) => {
          const t = e.target as HTMLInputElement;
          caretRef.current = t.selectionStart ?? -1;
        }}
        onKeyUp={(e) => {
          const t = e.target as HTMLInputElement;
          caretRef.current = t.selectionStart ?? -1;
        }}
      />
      <VariablePicker
        variables={variables}
        catalogError={catalogError}
        disabled={disabled}
        size={size}
        className={styles['var-mention-picker']}
        getPopupContainer={() => rootRef.current || document.body}
        onPick={pick}
      />
    </div>
  );
};

const VariableMentionInner: FC<VariableMentionFieldProps> = (props) => {
  const { useDecorator } = (ReactFormAntd as unknown as { hooks: KneHooks }).hooks;
  // variables / catalogError 等经 useDecorator → others 下发；禁 render(() => …) 内联类型
  const render = useDecorator({
    fieldName: 'variableMentionInput',
    ...props,
  });
  return render(VariableMentionControl);
};

VariableMentionInner.displayName = 'VariableMentionField';

export const VariableMentionField =
  VariableMentionInner as ComponentType<VariableMentionFieldProps>;

export default VariableMentionField;
