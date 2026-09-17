import { describe, expect, it } from 'vitest';
import {
  filterVariableFeed,
  insertVarTokenAt,
  normalizeMentionHtmlToVarTokens,
  toVarToken,
  upliftVarTokensToMentions,
} from '../../../Editor/variableMention';
import { listFixtureCatalog, resetMsgCenterFixture } from '../doc/msgCenter.fixture';
import { applyTemplateVars } from '../utils/templateCode';
import { previewVarsFromVariables, variablesFromCatalog } from '../MessageTemplateAdmin/types';

describe('variableMention utils', () => {
  it('toVarToken and insertVarTokenAt', () => {
    expect(toVarToken('factory')).toBe('{factory}');
    expect(insertVarTokenAt('a', 'factory', 1)).toBe('a{factory}');
  });

  it('filterVariableFeed by key/label', () => {
    const vars = [
      { key: 'factory', label: '分厂' },
      { key: 'bizDate', label: '业务日' },
    ];
    expect(filterVariableFeed(vars, '厂').map((v) => v.key)).toEqual(['factory']);
    expect(filterVariableFeed(vars, 'biz').map((v) => v.key)).toEqual(['bizDate']);
  });

  it('normalizeMentionHtmlToVarTokens keeps {key}', () => {
    const html = '<p><span class="mention" data-mention="/factory">/factory</span></p>';
    expect(normalizeMentionHtmlToVarTokens(html)).toContain('{factory}');
    expect(normalizeMentionHtmlToVarTokens(html)).toContain('msg-var-token');
  });

  it('upliftVarTokensToMentions wraps bare tokens', () => {
    const up = upliftVarTokensToMentions('<p>{machine}</p>');
    expect(up).toContain('data-mention="/machine"');
  });
});

describe('catalog variables SSOT', () => {
  it('listFixtureCatalog exposes variables', () => {
    resetMsgCenterFixture();
    const cat = listFixtureCatalog();
    expect(cat.variables.some((v) => v.key === 'factory')).toBe(true);
    expect(variablesFromCatalog(cat).length).toBeGreaterThan(0);
  });

  it('array catalog payload yields empty variables (compat)', () => {
    expect(variablesFromCatalog({ events: [], variables: [] })).toEqual([]);
  });

  it('previewVars replace braces', () => {
    const vars = variablesFromCatalog(listFixtureCatalog());
    const preview = previewVarsFromVariables(vars);
    const out = applyTemplateVars('分厂 {factory}', preview);
    expect(out).not.toContain('{factory}');
    expect(out).toContain(preview.factory);
  });
});
