import { Plugin } from 'ckeditor5';

/**
 * 允许正文中的变量色块 span.msg-var-token（否则 CK 默认剥掉自定义 span → 无颜色）。
 */
export class MsgVarToken extends Plugin {
  public static get pluginName() {
    return 'MsgVarToken' as const;
  }

  public init(): void {
    const editor = this.editor;

    editor.model.schema.extend('$text', {
      allowAttributes: 'msgVarToken',
    });

    editor.conversion.for('downcast').attributeToElement({
      model: 'msgVarToken',
      view: (_value, { writer }) =>
        writer.createAttributeElement('span', { class: 'msg-var-token' }, { priority: 5 }),
    });

    editor.conversion.for('upcast').elementToAttribute({
      view: {
        name: 'span',
        classes: ['msg-var-token'],
      },
      model: {
        key: 'msgVarToken',
        value: true,
      },
    });
  }
}
