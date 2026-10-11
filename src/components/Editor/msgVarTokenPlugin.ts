import {
  Plugin,
  Widget,
  toWidget,
  viewToModelPositionOutsideModelElement,
  type Editor,
  type ModelElement,
  type ViewDowncastWriter,
  type ViewElement,
} from 'ckeditor5';
import { MSG_VAR_TOKEN_CLASS, toVarToken } from './variableMention';

/** 色块可持久化的文本样式（$inlineObject 本身不吃 bold 等 text attribute） */
export const MSG_VAR_MARK_ATTRS = [
  'bold',
  'italic',
  'underline',
  'fontColor',
  'fontBackgroundColor',
] as const;

export type MsgVarMarkAttr = (typeof MSG_VAR_MARK_ATTRS)[number];

type MsgVarMarks = Partial<{
  bold: true;
  italic: true;
  underline: true;
  fontColor: string;
  fontBackgroundColor: string;
}>;

/**
 * 正文变量原子色块：isObject inline widget。
 * 不可改内部字符；Backspace/Delete 整颗删（对齐 Coze/Dify chip）。
 * 加粗/斜体/下划线/字色落在色块上时写入 model 属性，存盘再包回 HTML，避免重开丢失。
 */
export class MsgVarWidget extends Plugin {
  public static get pluginName() {
    return 'MsgVarWidget' as const;
  }

  public static get requires() {
    return [Widget] as const;
  }

  public init(): void {
    const editor = this.editor;
    this.#defineSchema();
    this.#defineConverters();
    this.#bindFormatCommands();

    editor.editing.mapper.on(
      'viewToModelPosition',
      viewToModelPositionOutsideModelElement(editor.model, (viewElement) =>
        viewElement.hasClass(MSG_VAR_TOKEN_CLASS),
      ),
    );
  }

  #defineSchema(): void {
    const schema = this.editor.model.schema;
    schema.register('msgVar', {
      inheritAllFrom: '$inlineObject',
      allowAttributes: ['key', ...MSG_VAR_MARK_ATTRS],
    });
  }

  #defineConverters(): void {
    const conversion = this.editor.conversion;

    conversion.for('editingDowncast').elementToElement({
      model: 'msgVar',
      view: (modelItem, { writer }) => {
        const key = String(modelItem.getAttribute('key') || '');
        // 编辑态：toWidget 必须包在色块 span 上；样式用 data-* + CSS，勿外包 strong
        const chip = createMsgVarChipView(writer, key, collectMarksFromModel(modelItem));
        return toWidget(chip, writer, { label: `变量 ${key}` });
      },
    });

    conversion.for('dataDowncast').elementToElement({
      model: 'msgVar',
      view: (modelItem, { writer }) => {
        const key = String(modelItem.getAttribute('key') || '');
        const marks = collectMarksFromModel(modelItem);
        const chip = createMsgVarChipView(writer, key, marks);
        return wrapMsgVarViewWithMarks(writer, chip, marks);
      },
    });

    conversion.for('upcast').elementToElement({
      view: {
        name: 'span',
        classes: [MSG_VAR_TOKEN_CLASS],
      },
      model: (viewElement, { writer }) => {
        const key = resolveKeyFromView(viewElement);
        if (!key) return null;
        const el = writer.createElement('msgVar', { key });
        const marks: MsgVarMarks = {
          ...collectMarksFromDataAttrs(viewElement),
          ...collectMarksFromAncestors(viewElement),
        };
        applyMarksToModel(writer, el, marks);
        return el;
      },
    });
  }

  /** 选中色块时，工具栏加粗/斜体/下划线/字色作用在 msgVar 属性上 */
  #bindFormatCommands(): void {
    const editor = this.editor;
    bindBooleanMarkCommand(editor, 'bold');
    bindBooleanMarkCommand(editor, 'italic');
    bindBooleanMarkCommand(editor, 'underline');
    bindColorMarkCommand(editor, 'fontColor', 'fontColor');
    bindColorMarkCommand(editor, 'fontBackgroundColor', 'fontBackgroundColor');

    const removeFormat = editor.commands.get('removeFormat');
    if (removeFormat) {
      removeFormat.on(
        'execute',
        (evt) => {
          const msgVar = getSelectedMsgVar(editor);
          if (!msgVar) return;
          evt.stop();
          editor.model.change((writer) => {
            for (const attr of MSG_VAR_MARK_ATTRS) {
              writer.removeAttribute(attr, msgVar);
            }
          });
        },
        { priority: 'high' },
      );
    }
  }
}

function bindBooleanMarkCommand(
  editor: Editor,
  commandName: 'bold' | 'italic' | 'underline',
): void {
  const command = editor.commands.get(commandName);
  if (!command) return;
  command.on(
    'execute',
    (evt) => {
      const msgVar = getSelectedMsgVar(editor);
      if (!msgVar) return;
      evt.stop();
      editor.model.change((writer) => {
        if (msgVar.getAttribute(commandName)) {
          writer.removeAttribute(commandName, msgVar);
        } else {
          writer.setAttribute(commandName, true, msgVar);
        }
      });
    },
    { priority: 'high' },
  );
  command.on(
    'refresh',
    () => {
      const msgVar = getSelectedMsgVar(editor);
      if (!msgVar) return;
      (command as { value: unknown; isEnabled: boolean }).value =
        !!msgVar.getAttribute(commandName);
      (command as { isEnabled: boolean }).isEnabled = true;
    },
    { priority: 'lowest' },
  );
}

function bindColorMarkCommand(
  editor: Editor,
  commandName: 'fontColor' | 'fontBackgroundColor',
  attr: 'fontColor' | 'fontBackgroundColor',
): void {
  const command = editor.commands.get(commandName);
  if (!command) return;
  command.on(
    'execute',
    (evt, args: { value?: string } | undefined) => {
      const msgVar = getSelectedMsgVar(editor);
      if (!msgVar) return;
      evt.stop();
      const next = String(args?.value || '').trim();
      editor.model.change((writer) => {
        if (!next) writer.removeAttribute(attr, msgVar);
        else writer.setAttribute(attr, next, msgVar);
      });
    },
    { priority: 'high' },
  );
  command.on(
    'refresh',
    () => {
      const msgVar = getSelectedMsgVar(editor);
      if (!msgVar) return;
      (command as { value: unknown; isEnabled: boolean }).value =
        msgVar.getAttribute(attr) || undefined;
      (command as { isEnabled: boolean }).isEnabled = true;
    },
    { priority: 'lowest' },
  );
}

function getSelectedMsgVar(editor: Editor): ModelElement | null {
  const sel = editor.model.document.selection;
  const selected = sel.getSelectedElement();
  if (selected?.is('element', 'msgVar')) return selected;
  const pos = sel.getFirstPosition();
  if (!pos) return null;
  const nodeBefore = pos.nodeBefore;
  const nodeAfter = pos.nodeAfter;
  if (nodeBefore?.is('element', 'msgVar') && sel.isCollapsed) return nodeBefore;
  if (nodeAfter?.is('element', 'msgVar') && sel.isCollapsed) return nodeAfter;
  return null;
}

function collectMarksFromModel(modelItem: ModelElement): MsgVarMarks {
  const marks: MsgVarMarks = {};
  if (modelItem.getAttribute('bold')) marks.bold = true;
  if (modelItem.getAttribute('italic')) marks.italic = true;
  if (modelItem.getAttribute('underline')) marks.underline = true;
  const color = String(modelItem.getAttribute('fontColor') || '').trim();
  const bg = String(modelItem.getAttribute('fontBackgroundColor') || '').trim();
  if (color) marks.fontColor = color;
  if (bg) marks.fontBackgroundColor = bg;
  return marks;
}

function applyMarksToModel(
  writer: { setAttribute: (key: string, value: unknown, el: ModelElement) => void },
  el: ModelElement,
  marks: MsgVarMarks,
): void {
  if (marks.bold) writer.setAttribute('bold', true, el);
  if (marks.italic) writer.setAttribute('italic', true, el);
  if (marks.underline) writer.setAttribute('underline', true, el);
  if (marks.fontColor) writer.setAttribute('fontColor', marks.fontColor, el);
  if (marks.fontBackgroundColor) {
    writer.setAttribute('fontBackgroundColor', marks.fontBackgroundColor, el);
  }
}

/** 色块自身 data-* / style（编辑态 downcast） */
export function collectMarksFromDataAttrs(viewElement: ViewElement): MsgVarMarks {
  const marks: MsgVarMarks = {};
  if (viewElement.getAttribute('data-bold') === '1') marks.bold = true;
  if (viewElement.getAttribute('data-italic') === '1') marks.italic = true;
  if (viewElement.getAttribute('data-underline') === '1') marks.underline = true;
  let color = String(viewElement.getAttribute('data-font-color') || '').trim();
  let bg = String(viewElement.getAttribute('data-font-bg') || '').trim();
  const style = String(viewElement.getAttribute('style') || '');
  if (!color) color = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(style)?.[1]?.trim() || '';
  if (!bg) {
    bg = /(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i.exec(style)?.[1]?.trim() || '';
  }
  if (color) marks.fontColor = color;
  if (bg) marks.fontBackgroundColor = bg;
  return marks;
}

/** 从色块祖先读取 strong/em/u/color，供 upcast 写入 model */
export function collectMarksFromAncestors(viewElement: ViewElement): MsgVarMarks {
  const marks: MsgVarMarks = {};
  let el: ViewElement | null = viewElement.parent as ViewElement | null;
  while (el && el.is('element')) {
    const name = el.name;
    if (name === 'strong' || name === 'b') marks.bold = true;
    if (name === 'em' || name === 'i') marks.italic = true;
    if (name === 'u') marks.underline = true;
    if (name === 'span') {
      const style = String(el.getAttribute('style') || '');
      const color = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(style)?.[1]?.trim();
      const bg = /(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i.exec(style)?.[1]?.trim();
      if (color && !marks.fontColor) marks.fontColor = color;
      if (bg && !marks.fontBackgroundColor) marks.fontBackgroundColor = bg;
    }
    if (['p', 'li', 'div', 'h1', 'h2', 'h3', 'h4', 'td', 'th', 'body'].includes(name)) break;
    el = el.parent as ViewElement | null;
  }
  return marks;
}

/**
 * dataDowncast：按 marks 包一层 HTML（strong/em/u/color），内层仍为 msg-var-token。
 * 导出供单测校验包层顺序。
 */
export function wrapMsgVarViewWithMarks(
  writer: ViewDowncastWriter,
  tokenView: ViewElement,
  marks: MsgVarMarks,
): ViewElement {
  let view: ViewElement = tokenView;
  if (marks.fontBackgroundColor) {
    view = writer.createContainerElement('span', {
      style: `background-color:${marks.fontBackgroundColor}`,
    });
    writer.insert(writer.createPositionAt(view, 0), tokenView);
    tokenView = view;
  }
  if (marks.fontColor) {
    const colorWrap = writer.createContainerElement('span', {
      style: `color:${marks.fontColor}`,
    });
    writer.insert(writer.createPositionAt(colorWrap, 0), view);
    view = colorWrap;
  }
  if (marks.underline) {
    const u = writer.createContainerElement('u');
    writer.insert(writer.createPositionAt(u, 0), view);
    view = u;
  }
  if (marks.italic) {
    const em = writer.createContainerElement('em');
    writer.insert(writer.createPositionAt(em, 0), view);
    view = em;
  }
  if (marks.bold) {
    const strong = writer.createContainerElement('strong');
    writer.insert(writer.createPositionAt(strong, 0), view);
    view = strong;
  }
  return view;
}

function createMsgVarChipView(
  writer: ViewDowncastWriter,
  key: string,
  marks: MsgVarMarks = {},
): ViewElement {
  const attrs: Record<string, string> = {
    class: MSG_VAR_TOKEN_CLASS,
    'data-var': key,
  };
  if (marks.bold) attrs['data-bold'] = '1';
  if (marks.italic) attrs['data-italic'] = '1';
  if (marks.underline) attrs['data-underline'] = '1';
  if (marks.fontColor) attrs['data-font-color'] = marks.fontColor;
  if (marks.fontBackgroundColor) attrs['data-font-bg'] = marks.fontBackgroundColor;

  const styleParts: string[] = [];
  if (marks.fontColor) styleParts.push(`color:${marks.fontColor}`);
  if (marks.fontBackgroundColor) {
    styleParts.push(`background-color:${marks.fontBackgroundColor}`);
  }
  if (styleParts.length) attrs.style = styleParts.join(';');

  const span = writer.createContainerElement('span', attrs);
  writer.insert(writer.createPositionAt(span, 0), writer.createText(toVarToken(key)));
  return span;
}

function resolveKeyFromView(viewElement: ViewElement): string {
  const fromAttr = String(viewElement.getAttribute('data-var') || '').trim();
  if (fromAttr) return fromAttr;
  let text = '';
  for (const child of viewElement.getChildren()) {
    if (child.is('$text') || child.is('$textProxy')) {
      text += child.data;
    }
  }
  const m = text.match(/^\{\{(\w+)\}\}$/);
  return m?.[1] ?? '';
}

/** 在选区插入原子变量色块，并焦点回编辑器 */
export function insertMsgVar(editor: Editor, key: string): void {
  const k = String(key || '').trim();
  if (!k) return;
  editor.model.change((writer) => {
    const el = writer.createElement('msgVar', { key: k });
    editor.model.insertContent(el);
  });
  editor.editing.view.focus();
}
