import * as ReactFormAntd from '@kne/react-form-antd';
import { Mentions } from 'antd';
import classNames from 'classnames';
import type { ComponentType, FC, ReactNode } from 'react';
import { useMemo } from 'react';
import {
  VAR_PLACEHOLDER_RE,
  filterVariableFeed,
  toVarToken,
  type VariableMentionItem,
} from '@/components/Editor/variableMention';
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

const VariableMentionControl: FC<
  FieldRenderProps & {
    variables?: VariableMentionItem[];
    placeholder?: string;
    className?: string;
  }
> = ({ value = '', onChange, disabled, variables, placeholder, className, id }) => {
  const options = useMemo(
    () =>
      filterVariableFeed(variables, '').map((v) => ({
        value: v.key,
        label: (
          <span className={styles['var-mention-option']}>
            <span className={styles['var-mention-token']}>{toVarToken(v.key)}</span>
            {v.label ? <span className={styles['var-mention-label']}>{v.label}</span> : null}
          </span>
        ),
      })),
    [variables],
  );

  const mentionsValue = useMemo(
    () => String(value || '').replace(VAR_PLACEHOLDER_RE, '/$1'),
    [value],
  );

  return (
    <Mentions
      id={id}
      prefix="/"
      value={mentionsValue}
      disabled={disabled}
      placeholder={placeholder || '输入 / 插入变量'}
      className={classNames('marsun-var-mention-input', styles['var-mention-input'], className)}
      options={options}
      onChange={(next) => {
        const normalized = String(next || '').replace(/\/(\w+)/g, (m, key: string) => {
          const hit = (variables || []).some((v) => v.key === key);
          return hit ? `{${key}}` : m;
        });
        onChange?.(normalized);
      }}
    />
  );
};

const VariableMentionInner: FC<VariableMentionFieldProps> = (props) => {
  const { useDecorator } = (ReactFormAntd as unknown as { hooks: KneHooks }).hooks;
  const { variables, placeholder, className, ...rest } = props;
  const render = useDecorator({
    fieldName: 'variableMentionInput',
    ...rest,
  });
  return render((fieldProps) => (
    <VariableMentionControl
      {...fieldProps}
      variables={variables}
      placeholder={placeholder}
      className={className}
    />
  ));
};

VariableMentionInner.displayName = 'VariableMentionField';

export const VariableMentionField =
  VariableMentionInner as ComponentType<VariableMentionFieldProps>;

export default VariableMentionField;
