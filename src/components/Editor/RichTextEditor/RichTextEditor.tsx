import React, { useEffect, useMemo, useRef } from 'react';
import {
  Bold,
  ClassicEditor,
  Essentials,
  FontBackgroundColor,
  FontColor,
  GeneralHtmlSupport,
  Italic,
  List,
  Paragraph,
  RemoveFormat,
  Underline,
  Undo,
  Widget,
  type Editor,
  type EditorConfig,
} from 'ckeditor5';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import 'ckeditor5/ckeditor5.css';
import { prepareEditorHtml, type VariableMentionItem } from '../variableMention';
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

const BASE_PLUGINS = [
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Underline,
  FontColor,
  FontBackgroundColor,
  GeneralHtmlSupport,
  List,
  Undo,
  RemoveFormat,
];

const TOOLBAR = [
  'undo',
  'redo',
  '|',
  'bold',
  'italic',
  'underline',
  '|',
  'fontColor',
  'fontBackgroundColor',
  '|',
  'bulletedList',
  'numberedList',
  '|',
  'removeFormat',
];

/**
 * CKEditor 5 + 变量色块。
 * - 只在「编辑区空 + 有外部 value」时 setData，禁止用 Form 旧值回灌冲掉字色/加粗
 * - GeneralHtmlSupport 保留 span[style]
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
  const enableVarRef = useRef(enableVariableMention);
  enableVarRef.current = enableVariableMention;
  /** 是否已完成首次灌入（之后禁止用 value 覆盖用户编辑） */
  const seededRef = useRef(false);

  const config = useMemo((): EditorConfig => {
    const plugins = enableVariableMention ? [...BASE_PLUGINS, Widget, MsgVarWidget] : BASE_PLUGINS;
    return {
      licenseKey: 'GPL',
      toolbar: TOOLBAR,
      placeholder,
      plugins,
      fontColor: {
        colors: [
          { color: '#000000', label: '黑色' },
          { color: '#EF4444', label: '红' },
          { color: '#F97316', label: '橙' },
          { color: '#EAB308', label: '黄' },
          { color: '#22C55E', label: '绿' },
          { color: '#2563EB', label: '蓝' },
          { color: '#7C3AED', label: '紫' },
          { color: '#6B7280', label: '灰' },
        ],
      },
      fontBackgroundColor: {
        colors: [
          { color: '#FEF08A', label: '浅黄' },
          { color: '#FECACA', label: '浅红' },
          { color: '#BBF7D0', label: '浅绿' },
          { color: '#BFDBFE', label: '浅蓝' },
          { color: '#E9D5FF', label: '浅紫' },
          { color: '#F3F4F6', label: '浅灰' },
        ],
      },
      htmlSupport: {
        allow: [
          { name: 'span', styles: true, classes: true, attributes: true },
          { name: 'strong', classes: true, attributes: true },
          { name: 'b', classes: true, attributes: true },
          { name: 'em', classes: true, attributes: true },
          { name: 'i', classes: true, attributes: true },
          { name: 'u', classes: true, attributes: true },
          { name: 'p', classes: true, attributes: true, styles: true },
          { name: 'ul', classes: true, attributes: true },
          { name: 'ol', classes: true, attributes: true },
          { name: 'li', classes: true, attributes: true },
        ],
      },
    } as EditorConfig;
  }, [enableVariableMention, placeholder]);

  const applyHtmlToEditor = (editor: Editor, raw: string) => {
    const html = prepareEditorHtml(raw, enableVarRef.current);
    suppressChangeRef.current = true;
    try {
      editor.setData(html);
      let applied = editor.getData();
      if (html && !applied.trim()) {
        editor.setData(`<p>${html.replace(/^<p>|<\/p>$/gi, '')}</p>`);
        applied = editor.getData();
      }
      seededRef.current = Boolean(applied.trim() || !html.trim());
      // 灌入后同步 Form，避免「编辑器有样式、Form 仍是旧纯文本」导致保存丢样式
      if (applied) {
        onChangeRef.current?.(applied);
      }
    } finally {
      queueMicrotask(() => {
        suppressChangeRef.current = false;
      });
    }
  };

  // 仅：编辑区仍空且外部已有正文 → 回填一次。禁止在用户编辑后用 value 再 setData。
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const prepared = prepareEditorHtml(value || '', enableVariableMention);
    if (!prepared.trim()) return;
    const live = editor.getData();
    if (live.trim()) return;
    applyHtmlToEditor(editor, value || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, enableVariableMention]);

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
            seededRef.current = false;
            applyHtmlToEditor(editor, value || '');
          }}
          onChange={(_evt, editor) => {
            if (suppressChangeRef.current) return;
            const html = editor.getData();
            seededRef.current = true;
            onChangeRef.current?.(html);
          }}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
