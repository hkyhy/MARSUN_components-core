import * as ReactFormAntd from '@kne/react-form-antd';
import classNames from 'classnames';
import type { ComponentType, FC, ReactNode } from 'react';
import { Suspense, lazy } from 'react';
import type { VariableMentionItem } from '@/components/Editor/variableMention';
import styles from './style.module.scss';

const RichTextEditor = lazy(() =>
  import('@/components/Editor').then((m) => ({ default: m.RichTextEditor })),
);

export type RichTextFieldProps = {
  name: string;
  label?: ReactNode;
  labelTips?: ReactNode | ((props: RichTextFieldProps) => ReactNode);
  rule?: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: number;
  enableVariableMention?: boolean;
  variables?: VariableMentionItem[];
  catalogError?: string;
  className?: string;
  /** remount 键（换文档时传入） */
  editorKey?: string;
  [key: string]: unknown;
};

type FieldRenderProps = {
  value?: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  id?: string;
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: number;
  enableVariableMention?: boolean;
  variables?: VariableMentionItem[];
  catalogError?: string;
  className?: string;
  editorKey?: string;
};

type KneHooks = {
  useDecorator: (
    opts: Record<string, unknown>,
  ) => (Comp: ComponentType<FieldRenderProps>) => ReactNode;
};

/**
 * FormInfo 富文本字段：外观对齐 Input；L2 Editor 懒加载；「插入变量」+ 原子色块。
 * 须作为稳定组件类型交给 useDecorator（禁内联函数，否则每键 remount 丢焦）。
 */
const RichTextControl: FC<FieldRenderProps> = ({
  value = '',
  onChange,
  disabled,
  readOnly,
  placeholder,
  minHeight = 140,
  enableVariableMention,
  variables,
  catalogError,
  className,
  editorKey,
  id,
}) => (
  <div
    className={classNames(
      'marsun-form-rich-text',
      styles['form-rich-text'],
      disabled && styles['form-rich-text-disabled'],
      className,
    )}
    data-field-id={id}
  >
    <Suspense fallback={<div className={styles['form-rich-text-loading']}>加载编辑器…</div>}>
      <RichTextEditor
        key={editorKey || 'rte'}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        minHeight={minHeight}
        enableVariableMention={enableVariableMention}
        variables={variables}
        catalogError={catalogError}
      />
    </Suspense>
  </div>
);

const RichTextFieldInner: FC<RichTextFieldProps> = (props) => {
  const { useDecorator } = (ReactFormAntd as unknown as { hooks: KneHooks }).hooks;
  const render = useDecorator({
    fieldName: 'richTextEditor',
    ...props,
  });
  return render(RichTextControl);
};

RichTextFieldInner.displayName = 'RichTextField';

export const RichTextField = RichTextFieldInner as ComponentType<RichTextFieldProps>;

export default RichTextField;
