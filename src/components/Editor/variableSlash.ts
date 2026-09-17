import type { Editor } from 'ckeditor5';
import { toVarToken } from './variableMention';

/** 取当前块内、光标前的纯文本（用于识别 /query） */
export function getTextBeforeCaret(editor: Editor): string {
  const pos = editor.model.document.selection.getFirstPosition();
  if (!pos || !pos.parent) return '';
  try {
    const start = editor.model.createPositionAt(pos.parent, 0);
    const range = editor.model.createRange(start, pos);
    let text = '';
    for (const item of range.getItems()) {
      if (item.is('$textProxy') || item.is('$text')) {
        text += item.data;
      }
    }
    return text;
  } catch {
    return '';
  }
}

export type SlashMatch = { query: string; matchLen: number };

export function matchSlashQuery(textBefore: string): SlashMatch | null {
  const m = String(textBefore || '').match(/\/([^\s/{}]*)$/);
  if (!m) return null;
  return { query: m[1] || '', matchLen: m[0].length };
}

/** 删掉光标前的 /query，插入带色块属性的 {{key}}，保持焦点在编辑器 */
export function insertVariableToken(editor: Editor, key: string, matchLen: number): void {
  const token = toVarToken(key);
  editor.model.change((writer) => {
    const selection = editor.model.document.selection;
    const pos = selection.getFirstPosition();
    if (!pos) return;
    if (matchLen > 0) {
      const start = pos.getShiftedBy(-matchLen);
      const range = writer.createRange(start, pos);
      writer.remove(range);
      writer.insertText(token, { msgVarToken: true }, start);
      writer.setSelection(start.getShiftedBy(token.length));
    } else {
      writer.insertText(token, { msgVarToken: true }, pos);
      writer.setSelection(pos.getShiftedBy(token.length));
    }
  });
  editor.editing.view.focus();
}
