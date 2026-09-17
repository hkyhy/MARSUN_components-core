import { CKEditor } from '@ckeditor/ckeditor5-react';
import { Bold, ClassicEditor, Essentials, Italic, List, Mention, Paragraph, Undo } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import React, { useMemo, useRef } from 'react';
import {
  filterVariableFeed,
  normalizeMentionHtmlToVarTokens,
  toMentionFeedItem,
  upliftVarTokensToMentions,
  type VariableMentionItem,
} from '../variableMention';
import styles from './style.module.scss';

export type RichTextEditorProps = {
  value?: string;
  onChange?: (html: string) => void;
  disabled?: boolean;
  /** 只读（不可编辑；与 disabled 视觉可区分） */
  readOnly?: boolean;
  placeholder?: string;
  /** 最小高度（px） */
  minHeight?: number;
  className?: string;
  /**
   * 开启变量 Mention：`/` 触发，插入 `{key}` 色块 token。
   * 变量须由调用方从 catalog 注入；禁止 FE DEFAULT_VARS。
   */
  enableVariableMention?: boolean;
  variables?: VariableMentionItem[];
};

/**
 * CKEditor 5 封装：基础格式 + 可选变量 Mention（L2 `/editor`）。
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
}) => {
  const variablesRef = useRef(variables);
  variablesRef.current = variables;

  const editorData = useMemo(() => {
    if (!enableVariableMention) return value;
    return upliftVarTokensToMentions(value);
  }, [value, enableVariableMention]);

  const config = useMemo(() => {
    const base = {
      licenseKey: 'GPL' as const,
      toolbar: ['undo', 'redo', '|', 'bold', 'italic', '|', 'bulletedList', 'numberedList'],
      placeholder,
    };

    if (!enableVariableMention) {
      return {
        ...base,
        plugins: [Essentials, Paragraph, Bold, Italic, List, Undo],
      };
    }

    return {
      ...base,
      plugins: [Essentials, Paragraph, Bold, Italic, List, Undo, Mention],
      mention: {
        feeds: [
          {
            marker: '/',
            minimumCharacters: 0,
            feed: (queryText: string) =>
              filterVariableFeed(variablesRef.current, queryText).map(toMentionFeedItem),
          },
        ],
      },
    };
  }, [enableVariableMention, placeholder]);

  const locked = disabled || readOnly;

  return (
    <div
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
      <CKEditor
        editor={ClassicEditor}
        config={config}
        data={editorData}
        disabled={locked}
        onChange={(_evt, editor) => {
          const raw = editor.getData();
          onChange?.(enableVariableMention ? normalizeMentionHtmlToVarTokens(raw) : raw);
        }}
      />
    </div>
  );
};

export default RichTextEditor;
