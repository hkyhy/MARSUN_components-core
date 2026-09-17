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
import React, { useEffect, useMemo, useRef } from 'react';
import {
  filterVariableFeed,
  formatVariableOptionLabel,
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
   * 开启变量 Mention：`/` 触发，插入 `{{key}}` 色块 token。
   * 变量须由调用方从 catalog 注入；禁止 FE DEFAULT_VARS。
   */
  enableVariableMention?: boolean;
  variables?: VariableMentionItem[];
};

/**
 * CKEditor 5：不传受控 `data`；仅 onReady / 外部 value 变化时 setData，键入保持光标。
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
  const lastEmittedRef = useRef<string | null>(null);
  const mentionRef = useRef(enableVariableMention);
  mentionRef.current = enableVariableMention;

  const toOutgoing = (raw: string, mention = enableVariableMention) =>
    mention ? normalizeMentionHtmlToVarTokens(raw) : raw;

  const toIncoming = (html: string, mention = enableVariableMention) =>
    mention ? upliftVarTokensToMentions(html) : html;

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const mention = mentionRef.current;
    const incoming = toIncoming(value || '', mention);
    const outgoingFromEditor = toOutgoing(editor.getData(), mention);
    // 刚由本组件发出 → 跳过，避免打乱光标
    if (lastEmittedRef.current != null && semanticEqual(value || '', lastEmittedRef.current)) {
      return;
    }
    if (semanticEqual(outgoingFromEditor, value || '')) {
      return;
    }
    const sel = editor.model.document.selection;
    const wasCollapsed = sel.isCollapsed;
    editor.setData(incoming);
    // setData 后光标通常在文档首；若仅外部重置则接受；本分支已排除自发出的 value
    void wasCollapsed;
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
            itemRenderer: (item: { key?: string; label?: string; id?: string; text?: string }) => {
              const key = String(item.key || String(item.id || '').replace(/^\//, ''));
              const label = item.label;
              const el = document.createElement('span');
              el.classList.add('msg-var-mention-item');
              el.textContent = formatVariableOptionLabel({ key, label });
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
          const incoming = toIncoming(value || '');
          if (incoming) {
            editor.setData(incoming);
          }
          lastEmittedRef.current = toOutgoing(editor.getData());
        }}
        onChange={(_evt, editor) => {
          const outgoing = toOutgoing(editor.getData());
          lastEmittedRef.current = outgoing;
          onChange?.(outgoing);
        }}
      />
    </div>
  );
};

/** 比较模板 HTML 语义：去标签/空白后看占位与文本是否一致 */
function semanticEqual(a: string, b: string): boolean {
  const norm = (html: string) =>
    String(html || '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  return norm(a) === norm(b);
}

export default RichTextEditor;
