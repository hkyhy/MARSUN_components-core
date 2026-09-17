import * as ReactFormAntd from '@kne/react-form-antd';
import { Input, Space } from 'antd';
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
  [key: string]: unknown;
};

type FieldRenderProps = {
  value?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  id?: string;
};

type KneHooks = {
  useDecorator: (
    opts: Record<string, unknown>,
  ) => (Comp: ComponentType<FieldRenderProps>) => ReactNode;
};

/**
 * 标题变量：Input +「插入变量」按钮（明文 {{key}}，可手改；无 `/` 触发）。
 */
const VariableMentionControl: FC<
  FieldRenderProps & {
    variables?: VariableMentionItem[];
    catalogError?: string;
    placeholder?: string;
    className?: string;
  }
> = ({ value = '', onChange, disabled, variables, catalogError, placeholder, className, id }) => {
  const caretRef = useRef(String(value || '').length);
  const rootRef = useRef<HTMLDivElement>(null);

  const pick = (key: string) => {
    const next = insertVarTokenAt(String(value || ''), key, caretRef.current);
    onChange?.(next);
    caretRef.current = caretRef.current + `{{${key}}}`.length;
  };

  return (
    <div ref={rootRef} className={styles['var-mention-wrap']}>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          id={id}
          value={value}
          disabled={disabled}
          placeholder={placeholder || '点右侧「插入变量」，或手打 {{key}}'}
          className={classNames('marsun-var-mention-input', styles['var-mention-input'], className)}
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
          getPopupContainer={() => rootRef.current || document.body}
          onPick={pick}
        />
      </Space.Compact>
    </div>
  );
};

const VariableMentionInner: FC<VariableMentionFieldProps> = (props) => {
  const { useDecorator } = (ReactFormAntd as unknown as { hooks: KneHooks }).hooks;
  const { variables, catalogError, placeholder, className, ...rest } = props;
  const render = useDecorator({
    fieldName: 'variableMentionInput',
    ...rest,
  });
  return render((fieldProps) => (
    <VariableMentionControl
      {...fieldProps}
      variables={variables}
      catalogError={catalogError}
      placeholder={placeholder}
      className={className}
    />
  ));
};

VariableMentionInner.displayName = 'VariableMentionField';

export const VariableMentionField =
  VariableMentionInner as ComponentType<VariableMentionFieldProps>;

export default VariableMentionField;
