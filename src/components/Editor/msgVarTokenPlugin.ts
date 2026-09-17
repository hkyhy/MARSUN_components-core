import {
  Plugin,
  Widget,
  toWidget,
  viewToModelPositionOutsideModelElement,
  type Editor,
  type ViewDowncastWriter,
  type ViewElement,
} from 'ckeditor5';
import { toVarToken } from './variableMention';

/**
 * 正文变量原子色块：isObject inline widget。
 * 不可改内部字符；Backspace/Delete 整颗删（对齐 Coze/Dify chip）。
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

    editor.editing.mapper.on(
      'viewToModelPosition',
      viewToModelPositionOutsideModelElement(editor.model, (viewElement) =>
        viewElement.hasClass('msg-var-token'),
      ),
    );
  }

  #defineSchema(): void {
    const schema = this.editor.model.schema;
    schema.register('msgVar', {
      inheritAllFrom: '$inlineObject',
      allowAttributes: ['key'],
    });
  }

  #defineConverters(): void {
    const conversion = this.editor.conversion;

    conversion.for('editingDowncast').elementToElement({
      model: 'msgVar',
      view: (modelItem, { writer }) => {
        const key = String(modelItem.getAttribute('key') || '');
        const widgetElement = createMsgVarView(writer, key);
        return toWidget(widgetElement, writer, { label: `变量 ${key}` });
      },
    });

    conversion.for('dataDowncast').elementToElement({
      model: 'msgVar',
      view: (modelItem, { writer }) => {
        const key = String(modelItem.getAttribute('key') || '');
        return createMsgVarView(writer, key);
      },
    });

    conversion.for('upcast').elementToElement({
      view: {
        name: 'span',
        classes: ['msg-var-token'],
      },
      model: (viewElement, { writer }) => {
        const key = resolveKeyFromView(viewElement);
        if (!key) return null;
        return writer.createElement('msgVar', { key });
      },
    });
  }
}

function createMsgVarView(writer: ViewDowncastWriter, key: string): ViewElement {
  const span = writer.createContainerElement('span', {
    class: 'msg-var-token',
    'data-var': key,
  });
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
