import React, { useMemo, useRef } from 'react';
import {
  Bold,
  ClassicEditor,
  Essentials,
  Italic,
  List,
  Paragraph,
  Undo,
  Widget,
  type Editor,
} from 'ckeditor5';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import 'ckeditor5/ckeditor5.css';
import { wrapVarTokensForDisplay, type VariableMentionItem } from '../variableMention';
import { MsgVarWidget, insertMsgVar } from '../msgVarTokenPlugin';
import { VariablePicker } from '../VariablePicker';
import styles from './style.module.scss';

export type RichTextEditorProps = {
  value?: string;
  onChange?: (html: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  /**
   * 开启变量色块 +「插入变量」按钮（catalog 注入；禁 FE DEFAULT_VARS）。
   * 无 `/` 触发；色块为原子 widget。
   */
  enableVariableMention?: boolean;
  variables?: VariableMentionItem[];
  /** catalog 失败短文案（按钮 disabled 提示） */
  catalogError?: string;
};

/**
 * CKEditor 5 + Coze/Dify 风「插入变量」按钮；正文 msgVar 原子色块。
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  disabled = false,
  readOnly = false,
  placeholder,
  minHeight = 140,
  className,
  enableVariableMention = false,
  variables,
  catalogError,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const suppressChangeRef = useRef(false);

  const initialHtmlRef = useRef(
    enableVariableMention ? wrapVarTokensForDisplay(value || '') : value || '',
  );

  const config = useMemo(() => {
    const plugins = enableVariableMention
      ? [Essentials, Paragraph, Bold, Italic, List, Undo, Widget, MsgVarWidget]
      : [Essentials, Paragraph, Bold, Italic, List, Undo];
    return {
      licenseKey: 'GPL' as const,
      toolbar: ['undo', 'redo', '|', 'bold', 'italic', '|', 'bulletedList', 'numberedList'],
      placeholder,
      plugins,
    };
  }, [enableVariableMention, placeholder]);

  const locked = disabled || readOnly;

  return (
    <div
      ref={rootRef}
      className={
        className
          ? `${styles.root} ${styles['rich-text-editor']} ${className}`
          : `${styles.root} ${styles['rich-text-editor']}`
      }
      style={{ ['--rte-min-height' as string]: `${minHeight}px` }}
      data-disabled={disabled ? '1' : '0'}
      data-readonly={readOnly ? '1' : '0'}
      data-var-mention={enableVariableMention ? '1' : '0'}
    >
      {enableVariableMention ? (
        <div className={styles['var-toolbar']}>
          <VariablePicker
            variables={variables}
            catalogError={catalogError}
            disabled={locked}
            getPopupContainer={() => rootRef.current || document.body}
            onPick={(key) => {
              const editor = editorRef.current;
              if (!editor) return;
              insertMsgVar(editor, key);
            }}
          />
        </div>
      ) : null}
      <div className={styles['editor-host']}>
        <CKEditor
          editor={ClassicEditor}
          config={config}
          disabled={locked}
          onReady={(editor) => {
            editorRef.current = editor;
            suppressChangeRef.current = true;
            try {
              editor.setData(initialHtmlRef.current);
            } finally {
              queueMicrotask(() => {
                suppressChangeRef.current = false;
              });
            }
          }}
          onChange={(_evt, editor) => {
            if (suppressChangeRef.current) return;
            onChangeRef.current?.(editor.getData());
          }}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
