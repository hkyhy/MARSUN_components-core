import * as ReactFormAntd from '@kne/react-form-antd';
import { Dropdown, Input } from 'antd';
import classNames from 'classnames';
import type { ComponentType, FC, ReactNode } from 'react';
import { useMemo, useRef, useState } from 'react';
import {
  filterVariableFeed,
  insertVarTokenAt,
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

/**
 * 标题变量：普通 Input + `/` 下拉（中文 + code，无前导 /）；存盘 `{{key}}`。
 */
const VariableMentionControl: FC<
  FieldRenderProps & {
    variables?: VariableMentionItem[];
    placeholder?: string;
    className?: string;
  }
> = ({ value = '', onChange, disabled, variables, placeholder, className, id }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const caretRef = useRef(-1);
  const slashStartRef = useRef(-1);

  const options = useMemo(() => {
    return filterVariableFeed(variables, query).map((v) => ({
      key: v.key,
      label: (
        <span className={styles['var-mention-option']}>
          {v.label ? <span className={styles['var-mention-label']}>{v.label}</span> : null}
          <span className={styles['var-mention-token']}>{v.key}</span>
        </span>
      ),
    }));
  }, [variables, query]);

  const pick = (key: string) => {
    const src = String(value || '');
    const slashAt = slashStartRef.current;
    const caret = caretRef.current;
    let next: string;
    if (slashAt >= 0 && caret >= slashAt) {
      next = `${src.slice(0, slashAt)}${toVarToken(key)}${src.slice(caret)}`;
    } else {
      next = insertVarTokenAt(src, key, caret);
    }
    onChange?.(next);
    setOpen(false);
    setQuery('');
    slashStartRef.current = -1;
  };

  return (
    <Dropdown
      open={open && !disabled && options.length > 0}
      onOpenChange={(v) => {
        if (!v) setOpen(false);
      }}
      menu={{
        items: options.map((o) => ({
          key: o.key,
          label: o.label,
          onClick: () => pick(o.key),
        })),
      }}
      dropdownRender={(menu) => <div onMouseDown={(e) => e.preventDefault()}>{menu}</div>}
      trigger={[]}
    >
      <Input
        id={id}
        value={value}
        disabled={disabled}
        placeholder={placeholder || '输入 / 插入变量（中文 + code）'}
        className={classNames('marsun-var-mention-input', styles['var-mention-input'], className)}
        onChange={(e) => {
          const next = e.target.value;
          const caret = e.target.selectionStart ?? next.length;
          caretRef.current = caret;
          onChange?.(next);
          const before = next.slice(0, caret);
          const m = before.match(/\/([^\s/{}]*)$/);
          if (m) {
            slashStartRef.current = caret - m[0].length;
            setQuery(m[1] || '');
            setOpen(true);
          } else {
            slashStartRef.current = -1;
            setOpen(false);
            setQuery('');
          }
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
    </Dropdown>
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
