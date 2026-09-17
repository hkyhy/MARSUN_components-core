import { describe, expect, it } from 'vitest';
import {
  filterVariableFeed,
  formatVariableOptionLabel,
  insertVarTokenAt,
  normalizeMentionHtmlToVarTokens,
  toVarToken,
  upliftVarTokensToMentions,
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

  it('normalizeMentionHtmlToVarTokens keeps {{key}}', () => {
    const html = '<p><span class="mention" data-mention="/factory">/factory</span></p>';
    expect(normalizeMentionHtmlToVarTokens(html)).toContain('{{factory}}');
  });

  it('upliftVarTokensToMentions wraps double tokens', () => {
    const up = upliftVarTokensToMentions('<p>{{machine}}</p>');
    expect(up).toContain('data-mention="/machine"');
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
