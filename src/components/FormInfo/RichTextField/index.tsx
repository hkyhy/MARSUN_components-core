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
};

type KneHooks = {
  useDecorator: (
    opts: Record<string, unknown>,
  ) => (Comp: ComponentType<FieldRenderProps>) => ReactNode;
};

/**
 * FormInfo 富文本字段：外观对齐 Input 控件边框；L2 Editor 懒加载。
 */
const RichTextControl: FC<
  FieldRenderProps & {
    readOnly?: boolean;
    placeholder?: string;
    minHeight?: number;
    enableVariableMention?: boolean;
    variables?: VariableMentionItem[];
    className?: string;
    editorKey?: string;
  }
> = ({
  value = '',
  onChange,
  disabled,
  readOnly,
  placeholder,
  minHeight = 140,
  enableVariableMention,
  variables,
  className,
  editorKey,
  id,
}) => (
  <div
    id={id}
    className={classNames(
      'marsun-form-rich-text',
      styles['form-rich-text'],
      disabled && styles['form-rich-text-disabled'],
      className,
    )}
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
      />
    </Suspense>
  </div>
);

const RichTextFieldInner: FC<RichTextFieldProps> = (props) => {
  const { useDecorator } = (ReactFormAntd as unknown as { hooks: KneHooks }).hooks;
  const {
    variables,
    placeholder,
    className,
    enableVariableMention,
    readOnly,
    minHeight,
    editorKey,
    ...rest
  } = props;
  const render = useDecorator({
    fieldName: 'richTextEditor',
    ...rest,
  });
  return render((fieldProps) => (
    <RichTextControl
      {...fieldProps}
      variables={variables}
      placeholder={placeholder}
      className={className}
      enableVariableMention={enableVariableMention}
      readOnly={readOnly}
      minHeight={minHeight}
      editorKey={editorKey}
    />
  ));
};

RichTextFieldInner.displayName = 'RichTextField';

export const RichTextField = RichTextFieldInner as ComponentType<RichTextFieldProps>;

export default RichTextField;
