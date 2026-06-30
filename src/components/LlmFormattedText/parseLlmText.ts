/** 将 LLM 纯文本解析为带层级的内容块 */

const SECTION_RULES = [
  { type: 'causes', titles: ['可能原因', '原因分析', '主要原因', '异常原因'] },
  { type: 'suggestions', titles: ['建议', '改进建议', '处置建议', '应对措施', '整改建议'] },
  { type: 'summary', titles: ['异常说明', '情况说明', '分析结论', '结论'] },
] as const;

const LIST_ITEM_RE =
  /(?:^|\s)(?:[（(]?\d+[)）]|[①②③④⑤⑥⑦⑧⑨⑩⑪⑫]|(?<!\d)\d+[、.．])(?=\s*[^\d])/g;

export type LlmTextSection = {
  type: string;
  title: string;
  items: string[];
};

export type ParsedLlmText = {
  summary: string;
  sections: LlmTextSection[];
  loading?: boolean;
};

function normalizeText(text: string) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitListItems(block: string) {
  const trimmed = block.trim();
  if (!trimmed) return [];

  const parts = trimmed
    .split(LIST_ITEM_RE)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length > 1) return parts;

  const lineParts = trimmed
    .split(/\n+/)
    .map((s) => s.replace(/^[（(]?\d+[)）]\s*|^[①②③④⑤⑥⑦⑧⑨⑩]\s*|\d+[、.．]\s*/, '').trim())
    .filter(Boolean);
  if (lineParts.length > 1) return lineParts;

  return [trimmed];
}

export function parseLlmText(text: string): ParsedLlmText {
  const raw = normalizeText(text);
  if (!raw) return { summary: '', sections: [] };

  if (/^(正在|思考中|分析中|加载)/.test(raw) && raw.length < 40) {
    return { summary: raw, sections: [], loading: true };
  }

  const sections: LlmTextSection[] = [];
  let summary = '';

  const ordered: { type: string; title: string; index: number; len: number }[] = [];
  for (const rule of SECTION_RULES) {
    for (const title of rule.titles) {
      const re = new RegExp(`(${title})[：:\\s]*`, 'g');
      let m: RegExpExecArray | null;
      while ((m = re.exec(raw)) !== null) {
        ordered.push({ type: rule.type, title, index: m.index, len: m[0].length });
      }
    }
  }
  ordered.sort((a, b) => a.index - b.index);

  if (ordered.length === 0) {
    return { summary: raw, sections: [] };
  }

  const first = ordered[0]!;
  if (first.index > 0) {
    summary = raw.slice(0, first.index).replace(/[：:\s]+$/, '').trim();
  }

  for (let i = 0; i < ordered.length; i += 1) {
    const cur = ordered[i]!;
    const start = cur.index + cur.len;
    const next = ordered[i + 1];
    const end = next ? next.index : raw.length;
    const body = raw.slice(start, end).trim();
    const items = splitListItems(body);
    sections.push({
      type: cur.type,
      title: cur.title,
      items: items.length ? items : [body],
    });
  }

  if (!summary && sections.length) {
    const firstIdx = first.index;
    if (firstIdx > 80) summary = raw.slice(0, firstIdx).trim();
  }

  if (!summary && sections.length === 0) summary = raw;

  return { summary, sections };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 供静态 HTML 报告使用的排版 HTML */
export function formatLlmTextToHtml(text: string) {
  const parsed = parseLlmText(text);
  if (parsed.loading) {
    return `<p class="ft-loading">${escapeHtml(parsed.summary)}</p>`;
  }

  const parts: string[] = [];
  if (parsed.summary) {
    parts.push(`<p class="ft-summary">${escapeHtml(parsed.summary)}</p>`);
  }
  for (const sec of parsed.sections) {
    const cls = `ft-section ft-${sec.type}`;
    const items =
      sec.items.length > 1
        ? `<ul class="ft-list">${sec.items
            .map(
              (item, i) =>
                `<li><span class="ft-num">${i + 1}</span><span class="ft-item-text">${escapeHtml(item)}</span></li>`,
            )
            .join('')}</ul>`
        : `<p class="ft-paragraph">${escapeHtml(sec.items[0] || '')}</p>`;
    parts.push(
      `<section class="${cls}"><h4 class="ft-section-title">${escapeHtml(sec.title)}</h4>${items}</section>`,
    );
  }
  if (!parts.length) {
    return `<p class="ft-paragraph">${escapeHtml(text || '')}</p>`;
  }
  return `<div class="formatted-text">${parts.join('')}</div>`;
}
