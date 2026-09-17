import { Dropdown } from 'antd';
import React, { useMemo, useRef, useState } from 'react';
import {
  Bold,
  ClassicEditor,
  Essentials,
  Italic,
  List,
  Paragraph,
  Undo,
  type Editor,
} from 'ckeditor5';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import 'ckeditor5/ckeditor5.css';
import {
  filterVariableFeed,
  wrapVarTokensForDisplay,
  type VariableMentionItem,
} from '../variableMention';
import { MsgVarToken } from '../msgVarTokenPlugin';
import { getTextBeforeCaret, insertVariableToken, matchSlashQuery } from '../variableSlash';
import styles from './style.module.scss';
import slashStyles from '../../FormInfo/VariableMentionInput/style.module.scss';

export type RichTextEditorProps = {
  value?: string;
  onChange?: (html: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  /**
   * 开启 `/` 变量选择（与标题 VariableMentionField 同一套 antd Dropdown，不走 CK Mention）。
   * 变量须由 catalog 注入；禁止 FE DEFAULT_VARS。
   */
  enableVariableMention?: boolean;
  variables?: VariableMentionItem[];
};

/**
 * CKEditor 5 + 标题字段同一套 `/` → antd Dropdown 插 `{{key}}`。
 * 不用 CK Mention（气球层出 Modal 会立刻 blur）。
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
  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const suppressChangeRef = useRef(false);
  const slashMatchLenRef = useRef(0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');

  const initialHtmlRef = useRef(
    enableVariableMention ? wrapVarTokensForDisplay(value || '') : value || '',
  );

  const options = useMemo(() => filterVariableFeed(variables, query), [variables, query]);

  const config = useMemo(() => {
    const plugins = enableVariableMention
      ? [Essentials, Paragraph, Bold, Italic, List, Undo, MsgVarToken]
      : [Essentials, Paragraph, Bold, Italic, List, Undo];
    return {
      licenseKey: 'GPL' as const,
      toolbar: ['undo', 'redo', '|', 'bold', 'italic', '|', 'bulletedList', 'numberedList'],
      placeholder,
      plugins,
    };
  }, [enableVariableMention, placeholder]);

  const syncSlashMenu = (editor: Editor) => {
    if (!enableVariableMention || disabled || readOnly) {
      setMenuOpen(false);
      return;
    }
    const hit = matchSlashQuery(getTextBeforeCaret(editor));
    if (hit) {
      slashMatchLenRef.current = hit.matchLen;
      setQuery(hit.query);
      setMenuOpen(true);
    } else {
      slashMatchLenRef.current = 0;
      setQuery('');
      setMenuOpen(false);
    }
  };

  const pick = (key: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    insertVariableToken(editor, key, slashMatchLenRef.current);
    slashMatchLenRef.current = 0;
    setMenuOpen(false);
    setQuery('');
  };

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
      <Dropdown
        open={menuOpen && !locked && options.length > 0}
        onOpenChange={(v) => {
          if (!v) setMenuOpen(false);
        }}
        trigger={[]}
        getPopupContainer={() => rootRef.current || document.body}
        dropdownRender={(menu) => (
          <div
            onMouseDown={(e) => {
              // 防止菜单抢焦点导致 CK contenteditable blur
              e.preventDefault();
            }}
          >
            {menu}
          </div>
        )}
        menu={{
          items: options.map((v) => ({
            key: v.key,
            label: (
              <span className={slashStyles['var-mention-option']}>
                {v.label ? (
                  <span className={slashStyles['var-mention-label']}>{v.label}</span>
                ) : null}
                <span className={slashStyles['var-mention-token']}>{v.key}</span>
              </span>
            ),
            onClick: () => pick(v.key),
          })),
        }}
      >
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
              editor.editing.view.document.on('keyup', () => {
                syncSlashMenu(editor);
              });
              editor.editing.view.document.on('mouseup', () => {
                syncSlashMenu(editor);
              });
            }}
            onChange={(_evt, editor) => {
              if (suppressChangeRef.current) return;
              syncSlashMenu(editor);
              onChangeRef.current?.(editor.getData());
            }}
          />
        </div>
      </Dropdown>
    </div>
  );
};

export default RichTextEditor;
