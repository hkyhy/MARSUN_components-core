import { describe, expect, it } from 'vitest';
import {
  ensureRichTextBlockHtml,
  filterVariableFeed,
  formatVariableOptionLabel,
  insertVarTokenAt,
  normalizeMentionHtmlToVarTokens,
  prepareEditorHtml,
  splitInlineFormatAroundMsgVars,
  toVarToken,
  unwrapMsgVarSpansForStorage,
  wrapVarTokensForDisplay,
} from '../../../Editor/variableMention';
import { listFixtureCatalog, resetMsgCenterFixture } from '../doc/msgCenter.fixture';
import { applyTemplateVars, normalizeTemplatePlaceholders } from '../utils/templateCode';
import { previewVarsFromVariables, variablesFromCatalog } from '../MessageTemplateAdmin/types';

describe('variableMention utils', () => {
  it('toVarToken uses double braces', () => {
    expect(toVarToken('factory')).toBe('{{factory}}');
    expect(insertVarTokenAt('a', 'factory', 1)).toBe('a{{factory}}');
  });

  it('formatVariableOptionLabel shows label + code without slash', () => {
    expect(formatVariableOptionLabel({ key: 'factory', label: '分厂' })).toBe('分厂  factory');
    expect(formatVariableOptionLabel({ key: 'x' })).toBe('x');
  });

  it('filterVariableFeed by key/label', () => {
    const vars = [
      { key: 'factory', label: '分厂' },
      { key: 'bizDate', label: '业务日' },
    ];
    expect(filterVariableFeed(vars, '厂').map((v) => v.key)).toEqual(['factory']);
  });

  it('normalizeMentionHtmlToVarTokens keeps {{key}} with data-var', () => {
    const html = '<p><span class="mention" data-mention="/factory">/factory</span></p>';
    const out = normalizeMentionHtmlToVarTokens(html);
    expect(out).toContain('{{factory}}');
    expect(out).toContain('data-var="factory"');
  });

  it('wrapVarTokensForDisplay wraps bare {{key}} with data-var for widget upcast', () => {
    const up = wrapVarTokensForDisplay('<p>{{machine}}</p>');
    expect(up).toContain('msg-var-token');
    expect(up).toContain('data-var="machine"');
    expect(up).toContain('{{machine}}');
    expect(up).not.toContain('data-mention');
  });

  it('plain-text body gets <p> wrap so CKEditor setData keeps content', () => {
    const plain =
      '{{assignee}}你好：友情提醒，任务「{{title}}」还有 1 天到期。请赶紧处理，避免超期。';
    expect(ensureRichTextBlockHtml(plain)).toMatch(/^<p>/);
    const prepared = prepareEditorHtml(plain, true);
    expect(prepared).toMatch(/^<p>/);
    expect(prepared).toContain('msg-var-token');
    expect(prepared).toContain('data-var="assignee"');
    expect(prepared).toContain('data-var="title"');
    expect(prepared).toContain('请赶紧处理');
  });

  it('splitInlineFormatAroundMsgVars keeps color/bold on text, marks chips', () => {
    const html =
      '<p><span style="color:#EF4444"><span class="msg-var-token" data-var="assignee">{{assignee}}</span>你好：你已跟进任务</span></p>';
    const out = splitInlineFormatAroundMsgVars(html);
    expect(out).toContain('data-font-color="#EF4444"');
    expect(out).toContain('msg-var-token');
    expect(out).toContain('你好：你已跟进任务');
    expect(out).toContain('style="color:#EF4444"');
    // color 壳内不应再包 msg-var-token
    const colorChunks = out.match(/<span[^>]*style="color:#EF4444"[^>]*>[\s\S]*?<\/span>/gi) || [];
    for (const chunk of colorChunks) {
      expect(chunk).not.toContain('msg-var-token');
    }
  });

  it('style round-trip: color+strong around plain text survives unwrap→prepare', () => {
    const edited =
      '<p><span class="msg-var-token" data-var="assignee">{{assignee}}</span>你好：' +
      '<span style="color:#EF4444"><strong>你已跟进任务</strong></span>' +
      '「<span class="msg-var-token" data-var="title">{{title}}</span>」</p>';
    const stored = unwrapMsgVarSpansForStorage(edited);
    expect(stored).toContain('color:#EF4444');
    expect(stored).toContain('<strong>你已跟进任务</strong>');
    expect(stored).not.toContain('msg-var-token');
    const loaded = prepareEditorHtml(stored, true);
    expect(loaded).toContain('color:#EF4444');
    expect(loaded).toContain('<strong>你已跟进任务</strong>');
    expect(loaded).toContain('msg-var-token');
  });

  it('wrap moves strong/color off chips onto data-* (CKEditor cannot wrap widgets)', () => {
    const bold = wrapVarTokensForDisplay('<p><strong>{{assignee}}</strong> 你好</p>');
    expect(bold).toContain('data-bold="1"');
    expect(bold).toContain('msg-var-token');
    expect(bold).toContain('data-var="assignee"');

    const color = wrapVarTokensForDisplay('<p><span style="color:#EF4444">{{title}}</span></p>');
    expect(color).toContain('data-font-color="#EF4444"');
    expect(color).toContain('data-var="title"');
  });

  it('unwrapMsgVarSpansForStorage keeps format wrappers, strips chip shell', () => {
    const html =
      '<p><strong><span class="msg-var-token" data-var="assignee" data-bold="1">{{assignee}}</span></strong>' +
      '<span style="color:#EF4444"><span class="msg-var-token" data-var="title">{{title}}</span></span></p>';
    const out = unwrapMsgVarSpansForStorage(html);
    expect(out).toContain('<strong>{{assignee}}</strong>');
    expect(out).toContain('<span style="color:#EF4444">{{title}}</span>');
    expect(out).not.toContain('msg-var-token');
    // round-trip: unwrap → wrap 后样式落到色块 data-*（供 MsgVar upcast）
    const again = wrapVarTokensForDisplay(out);
    expect(again).toContain('data-bold="1"');
    expect(again).toContain('data-font-color="#EF4444"');
    expect(again).toContain('msg-var-token');
  });
});

describe('catalog variables SSOT', () => {
  it('listFixtureCatalog exposes variables', () => {
    resetMsgCenterFixture();
    const cat = listFixtureCatalog();
    expect(variablesFromCatalog(cat).some((v) => v.key === 'factory')).toBe(true);
  });

  it('normalize single to double; preview replaces', () => {
    expect(normalizeTemplatePlaceholders('{factory}')).toBe('{{factory}}');
    expect(normalizeTemplatePlaceholders('{{factory}}')).toBe('{{factory}}');
    const vars = variablesFromCatalog(listFixtureCatalog());
    const preview = previewVarsFromVariables(vars);
    const out = applyTemplateVars('分厂 {{factory}}', preview);
    expect(out).not.toContain('{{factory}}');
    expect(out).toContain(preview.factory);
  });
});
