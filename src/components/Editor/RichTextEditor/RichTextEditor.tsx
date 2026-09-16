import { CKEditor } from '@ckeditor/ckeditor5-react';
import { Bold, ClassicEditor, Essentials, Italic, List, Paragraph, Undo } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import React, { useMemo } from 'react';
import styles from './style.module.scss';

export type RichTextEditorProps = {
  value?: string;
  onChange?: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** 最小高度（px） */
  minHeight?: number;
  className?: string;
};

/**
 * CKEditor 5 封装：仅基础格式（粗体/斜体/列表），禁脚本扩展。
 * 用途：消息正文模板等需富文本的业务表单。
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  disabled = false,
  placeholder,
  minHeight = 140,
  className,
}) => {
  const config = useMemo(
    () => ({
      licenseKey: 'GPL' as const,
      plugins: [Essentials, Paragraph, Bold, Italic, List, Undo],
      toolbar: ['undo', 'redo', '|', 'bold', 'italic', '|', 'bulletedList', 'numberedList'],
      placeholder,
    }),
    [placeholder],
  );

  return (
    <div
      className={className ? `${styles.root} ${className}` : styles.root}
      style={{ ['--rte-min-height' as string]: `${minHeight}px` }}
      data-disabled={disabled ? '1' : '0'}
    >
      <CKEditor
        editor={ClassicEditor}
        config={config}
        data={value}
        disabled={disabled}
        onChange={(_evt, editor) => {
          onChange?.(editor.getData());
        }}
      />
    </div>
  );
};

export default RichTextEditor;
