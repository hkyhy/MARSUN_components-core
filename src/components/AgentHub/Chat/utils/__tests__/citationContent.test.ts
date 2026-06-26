import { describe, expect, it } from 'vitest';
import {
  citationDisplayNumber,
  citationIdToIndex,
  countUniqueCitedSources,
  detectCitationIdBase,
  extractCitationIdsFromContent,
  extractCitationTitle,
  formatCitationDocBasename,
  formatCitationMeta,
  formatCitationPositions,
  injectCitationMarkdownLinks,
  normalizeCitation,
  prepareCitationContent,
  resolveCitationTitle,
  stripCitationFrontmatter,
} from '../citationContent';

const mockContent =
  '根据企业制度，正式员工的年假天数与工龄相关：[ID:1]\n\n请假流程请参考考勤规定 [ID:2]。';

describe('extractCitationIdsFromContent', () => {
  it('extracts bracketed, parenthesized, and bare ID markers', () => {
    const content = '参考 [ID:0]、（ID:1）和 ID:2 以及 (ID:3)';
    expect(extractCitationIdsFromContent(content)).toEqual([0, 1, 2, 3]);
  });

  it('extracts hyphenated ID markers in reference notes', () => {
    const content = '注：实际生产中 [参考 ID-0, ID-2, ID-4, ID-5]。';
    expect(extractCitationIdsFromContent(content)).toEqual([0, 2, 4, 5]);
    expect(injectCitationMarkdownLinks(content)).toBe(
      '注：实际生产中 [参考 [0](#cite-0), [2](#cite-2), [4](#cite-4), [5](#cite-5)]。',
    );
  });

  it('injects all marker formats into markdown links', () => {
    const content = 'ID:0和[ID:1]';
    expect(injectCitationMarkdownLinks(content)).toBe('[0](#cite-0)和[1](#cite-1)');
  });
});

describe('countUniqueCitedSources', () => {
  it('counts unique cited sources when fewer than total chunks', () => {
    const content = '参考 [ID:0] 和 [ID:0] 以及 [ID:3]';
    expect(countUniqueCitedSources(content, 8)).toBe(2);
  });
});

describe('detectCitationIdBase', () => {
  it('detects 1-based ids in mock content', () => {
    expect(detectCitationIdBase(mockContent, 2)).toBe('one');
  });

  it('detects 0-based ids from RAGFlow', () => {
    expect(detectCitationIdBase('参考 [ID:0] 和 [ID:3]', 8)).toBe('zero');
  });
});

describe('citationIdToIndex', () => {
  it('maps 1-based mock ids correctly', () => {
    expect(citationIdToIndex(1, 2, mockContent)).toBe(0);
    expect(citationIdToIndex(2, 2, mockContent)).toBe(1);
  });

  it('maps 0-based RAGFlow ids correctly', () => {
    const content = 'text [ID:0] and [ID:3]';
    expect(citationIdToIndex(0, 8, content)).toBe(0);
    expect(citationIdToIndex(3, 8, content)).toBe(3);
  });
});

describe('citationDisplayNumber', () => {
  it('shows 1 and 2 for mock content with two citations', () => {
    expect(citationDisplayNumber(1, 2, mockContent)).toBe(1);
    expect(citationDisplayNumber(2, 2, mockContent)).toBe(2);
  });

  it('maps 0-based chunk id to panel number', () => {
    const content = '参考 [ID:0] 和 [ID:3]';
    expect(citationDisplayNumber(0, 8, content)).toBe(1);
    expect(citationDisplayNumber(3, 8, content)).toBe(4);
  });
});

describe('stripCitationFrontmatter', () => {
  it('removes yaml frontmatter', () => {
    const input = '---\ntags:\n- 纺织\n---\n# 标题\n正文';
    expect(stripCitationFrontmatter(input)).toBe('# 标题\n正文');
  });
});

describe('extractCitationTitle', () => {
  it('uses first markdown heading when doc_name missing', () => {
    const content = '---\ntags: []\n---\n# 质量检测分类\n表格内容';
    expect(extractCitationTitle(content, '来源 1')).toBe('质量检测分类');
  });

  it('extracts row label from html table instead of tag name', () => {
    const content =
      '<table>\n<thead>\n<tr>\n<th>刻度</th>\n<th>10</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>隔距(mm)</td>\n<td>8.0</td>\n</tr>\n</tbody>\n</table>';
    expect(extractCitationTitle(content, '来源 1')).toBe('隔距(mm)');
  });

  it('extracts section heading from markdown chunk', () => {
    const content = '### 并条（CFI 型，4道）\n| 参数 | CFI—L1 |';
    expect(extractCitationTitle(content, '来源 1')).toBe('并条（CFI 型，4道）');
  });

  it('extracts row label from markdown table wrapped in paragraph html', () => {
    const content = '<p>| 刻度 | 5 | 6 |\n|------|---|---|\n| 隔距(mm) | 6.34 | 7.47 |</p>';
    expect(extractCitationTitle(content, '来源 1')).toBe('隔距(mm)');
  });
});

describe('normalizeCitation', () => {
  it('maps RAGFlow chunk fields to Citation', () => {
    const citation = normalizeCitation({
      id: '5aeda3d1095522c4',
      document_id: 'f93bf2de64b011f189ab7be4233b4fad',
      document_name: '纺织入门妙妙屋/02-纺纱工艺/亚麻纺纱工艺设计举例.md',
      content: '### 并条（CFI 型，4道）',
      similarity: 0.6016274084285714,
      positions: [[5, 4, 4, 4, 4]],
    });

    expect(citation.doc_id).toBe('f93bf2de64b011f189ab7be4233b4fad');
    expect(citation.doc_name).toBe('纺织入门妙妙屋/02-纺纱工艺/亚麻纺纱工艺设计举例.md');
    expect(citation.score).toBeCloseTo(0.6016274084285714);
    expect(citation.page_no).toBe(5);
  });
});

describe('resolveCitationTitle', () => {
  it('shows document_name as title', () => {
    const citation = normalizeCitation({
      document_name: '纺织入门妙妙屋/02-纺纱工艺/精梳工序概述.md',
      content: '<table><tbody><tr><td>隔距(mm)</td><td>8.0</td></tr></tbody></table>',
    });

    expect(resolveCitationTitle(citation, 0)).toBe('纺织入门妙妙屋/02-纺纱工艺/精梳工序概述.md');
  });

  it('falls back to source index when document_name missing', () => {
    expect(resolveCitationTitle(normalizeCitation({}), 2)).toBe('来源 3');
  });
});

describe('formatCitationPositions', () => {
  it('formats RAGFlow page position', () => {
    expect(formatCitationPositions([[5, 4, 4, 4, 4]])).toBe('第 5 页');
  });

  it('returns undefined for empty positions', () => {
    expect(formatCitationPositions([])).toBeUndefined();
  });
});

describe('formatCitationMeta', () => {
  it('shows positions and match score', () => {
    const citation = normalizeCitation({
      document_name: '纺织入门妙妙屋/02-纺纱工艺/亚麻纺纱工艺设计举例.md',
      similarity: 0.6016274084285714,
      positions: [[5, 4, 4, 4, 4]],
    });

    expect(formatCitationMeta(citation)).toBe('第 5 页 · 匹配 60%');
  });

  it('shows only match score when positions empty', () => {
    const citation = normalizeCitation({
      document_name: '纺织入门妙妙屋/02-纺纱工艺/精梳工序概述.md',
      similarity: 0.6026360624285714,
      positions: [],
    });

    expect(formatCitationMeta(citation)).toBe('匹配 60%');
  });
});

describe('formatCitationDocBasename', () => {
  it('returns filename without extension', () => {
    expect(formatCitationDocBasename('纺织入门妙妙屋/02-纺纱工艺/精梳工序概述.md')).toBe(
      '精梳工序概述',
    );
  });
});

describe('prepareCitationContent', () => {
  it('detects html table content', () => {
    const result = prepareCitationContent('<table><tr><td>单元格</td></tr></table>');
    expect(result.isHtml).toBe(true);
    expect(result.body).toContain('<table');
  });

  it('detects markdown table content', () => {
    const result = prepareCitationContent('| 列 | 说明 |\n| --- | --- |');
    expect(result.isHtml).toBe(false);
    expect(result.body).toContain('| 列 |');
  });
});
