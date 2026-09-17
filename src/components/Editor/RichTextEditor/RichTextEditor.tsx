import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Bold,
  ClassicEditor,
  Essentials,
  Italic,
  List,
  Mention,
  Paragraph,
  Undo,
  type Editor,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import React, { useMemo, useRef } from 'react';
import {
  filterVariableFeed,
  formatVariableOptionLabel,
  normalizeMentionHtmlToVarTokens,
  toMentionFeedItem,
  wrapVarTokensForDisplay,
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
   * 开启变量 Mention：`/` 触发，插入 `{{key}}` 色块 token。
   * 变量须由调用方从 catalog 注入；禁止 FE DEFAULT_VARS。
   */
  enableVariableMention?: boolean;
  variables?: VariableMentionItem[];
};

/**
 * CKEditor 5：挂载时写一次初始 HTML；键入不回写 setData（杜绝卡死/失焦）。
 * 换文档请用 key 强制 remount。
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
  const editorRef = useRef<Editor | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  /** 程序性 setData 期间吞掉 change，避免 Form 回写死循环 */
  const suppressChangeRef = useRef(false);
  const initialHtmlRef = useRef(
    enableVariableMention ? wrapVarTokensForDisplay(value || '') : value || '',
  );

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
            dropdownLimit: 12,
            feed: (queryText: string) =>
              filterVariableFeed(variablesRef.current, queryText).map(toMentionFeedItem),
            itemRenderer: (item: { key?: string; label?: string; id?: string }) => {
              const key = String(item.key || String(item.id || '').replace(/^\//, ''));
              const el = document.createElement('span');
              el.classList.add('msg-var-mention-item');
              el.textContent = formatVariableOptionLabel({ key, label: item.label });
              return el;
            },
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
        disabled={locked}
        onReady={(editor) => {
          editorRef.current = editor;
          suppressChangeRef.current = true;
          try {
            editor.setData(initialHtmlRef.current);
          } finally {
            // 等 CK 同步派发完 change:data 再放开
            queueMicrotask(() => {
              suppressChangeRef.current = false;
            });
          }
        }}
        onChange={(_evt, editor) => {
          if (suppressChangeRef.current) return;
          const raw = editor.getData();
          const outgoing = enableVariableMention ? normalizeMentionHtmlToVarTokens(raw) : raw;
          onChangeRef.current?.(outgoing);
        }}
      />
    </div>
  );
};

export default RichTextEditor;
