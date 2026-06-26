import type { Citation } from '@/components/AgentHub/types';

export const CITATION_LINK_PREFIX = '#cite-';

/** RAGFlow / LLM 可能输出的引用标记（单次匹配，避免重复识别） */
const CITATION_MARKER_RE =
  /\[ID[:-](\d+)\]|[（(]ID[:-](\d+)[）)]|(?<![\w\[（(])ID[:-](\d+)(?![\w])/g;

function collectCitationIds(content: string): number[] {
  const ids: number[] = [];
  const re = new RegExp(CITATION_MARKER_RE.source, CITATION_MARKER_RE.flags);
  let match = re.exec(content);
  while (match) {
    const id = match[1] ?? match[2] ?? match[3];
    ids.push(parseInt(id!, 10));
    match = re.exec(content);
  }
  return ids;
}

/** 从正文中提取所有引用 ID（支持 [ID:n]、（ID:n）、ID:n 等格式） */
export function extractCitationIdsFromContent(content: string): number[] {
  return collectCitationIds(content);
}

/** 正文中实际引用到的来源数量（去重后的 citations 下标） */
export function countUniqueCitedSources(content: string, citationsLength: number): number {
  if (citationsLength <= 0) return 0;
  const indices = collectCitationIds(content).map((id) =>
    citationIdToIndex(id, citationsLength, content),
  );
  return new Set(indices).size;
}

/** 判断 [ID:n] 是 0-based 还是 1-based（RAGFlow 用 0-based，部分 mock/旧数据用 1-based） */
export function detectCitationIdBase(content: string, citationsLength: number): 'zero' | 'one' {
  const ids = extractCitationIdsFromContent(content);
  if (ids.length === 0 || citationsLength <= 0) return 'zero';

  if (ids.some((id) => id === 0)) return 'zero';

  // n === citationsLength 仅 1-based 合法（如 2 条来源时的 [ID:2]）
  if (ids.some((id) => id === citationsLength)) return 'one';

  const allZeroBasedValid = ids.every((id) => id >= 0 && id < citationsLength);
  const allOneBasedValid = ids.every((id) => id >= 1 && id <= citationsLength);

  if (allOneBasedValid && !allZeroBasedValid) return 'one';
  if (allZeroBasedValid && !allOneBasedValid) return 'zero';

  const uniqueSorted = [...new Set(ids)].sort((a, b) => a - b);
  if (
    uniqueSorted[0] === 1 &&
    uniqueSorted.length > 0 &&
    uniqueSorted.every((id, i) => id === i + 1)
  ) {
    return 'one';
  }

  return 'zero';
}

/** 将正文中的引用标记转为可自定义渲染的 markdown 链接 */
export function injectCitationMarkdownLinks(content: string): string {
  return content.replace(CITATION_MARKER_RE, (_, id1, id2, id3) => {
    const id = id1 ?? id2 ?? id3;
    return `[${id}](${CITATION_LINK_PREFIX}${id})`;
  });
}

export function parseCitationLinkHref(href?: string): number | null {
  if (!href?.startsWith(CITATION_LINK_PREFIX)) return null;
  const id = parseInt(href.slice(CITATION_LINK_PREFIX.length), 10);
  return Number.isNaN(id) ? null : id;
}

/** [ID:n] 映射到 citations 数组下标 */
export function citationIdToIndex(id: number, citationsLength: number, content?: string): number {
  if (citationsLength <= 0) return 0;
  const base = content ? detectCitationIdBase(content, citationsLength) : 'zero';
  const index = base === 'one' ? id - 1 : id;
  if (index >= 0 && index < citationsLength) return index;
  return Math.max(0, Math.min(index, citationsLength - 1));
}

/** 与侧栏 panel 一致的 1-based 展示序号 */
export function citationDisplayNumber(
  citationId: number,
  citationsLength: number,
  content?: string,
): number {
  return citationIdToIndex(citationId, citationsLength, content) + 1;
}

/** 去掉 RAG chunk 顶部的 YAML frontmatter */
export function stripCitationFrontmatter(content: string): string {
  return content.replace(/^\s*---[\s\S]*?---\s*/m, '').trim();
}

const HTML_TAG_ONLY_RE = /^<\/?[\w-]+(?:\s[^>]*)?>$/;
const MARKDOWN_TABLE_SEPARATOR_RE = /^\|?\s*:?-{3,}/;

const stripHtmlText = (html: string): string =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const isMeaningfulTitle = (text: string): boolean => {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 48) return false;
  if (HTML_TAG_ONLY_RE.test(trimmed)) return false;
  if (/^<\w/.test(trimmed)) return false;
  return true;
};

const unwrapParagraphWrapper = (content: string): string =>
  content
    .replace(/^<p[^>]*>/i, '')
    .replace(/<\/p>$/i, '')
    .trim();

const extractHtmlTableTitle = (html: string): string | null => {
  const tbodyRow = html.match(/<tbody[^>]*>[\s\S]*?<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i);
  if (tbodyRow?.[1]) {
    const text = stripHtmlText(tbodyRow[1]);
    if (text) return text;
  }

  const th = html.match(/<th[^>]*>([\s\S]*?)<\/th>/i);
  if (th?.[1]) {
    const text = stripHtmlText(th[1]);
    if (text) return text;
  }

  return null;
};

const extractMarkdownTableTitle = (content: string): string | null => {
  const rows: string[][] = [];

  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed.includes('|')) return;
    if (MARKDOWN_TABLE_SEPARATOR_RE.test(trimmed.replace(/\|/g, ''))) return;

    const cells = trimmed
      .split('|')
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0);
    if (cells.length >= 2) rows.push(cells);
  });

  if (rows.length >= 2) return rows[1]?.[0] ?? null;
  if (rows.length === 1) return rows[0]?.[0] ?? null;
  return null;
};

/** 文档路径取文件名（去扩展名） */
export function formatCitationDocBasename(docName?: string): string | undefined {
  if (!docName?.trim()) return undefined;

  const normalized = docName.trim().replace(/\\/g, '/');
  const basename = normalized.split('/').pop() ?? normalized;
  const withoutExt = basename.replace(/\.(md|pdf|txt|docx?)$/i, '');
  return withoutExt || basename;
}

/** 将 RAGFlow chunk 字段归一化为 Citation */
export function normalizeCitation(raw: Record<string, unknown>): Citation {
  const docName = raw.doc_name ?? raw.document_name;
  const docId = raw.doc_id ?? raw.document_id;
  const score =
    typeof raw.score === 'number'
      ? raw.score
      : typeof raw.similarity === 'number'
        ? raw.similarity
        : undefined;

  let pageNo = raw.page_no as number | null | undefined;
  if (pageNo == null && Array.isArray(raw.positions) && raw.positions.length > 0) {
    const firstPos = raw.positions[0];
    if (Array.isArray(firstPos) && typeof firstPos[0] === 'number' && firstPos[0] > 0) {
      pageNo = firstPos[0];
    }
  }

  return {
    id: typeof raw.id === 'string' ? raw.id : String(raw.doc_id ?? raw.document_id ?? Math.random()),
    doc_id: typeof docId === 'string' ? docId : undefined,
    doc_name: typeof docName === 'string' ? docName : undefined,
    dataset_id: typeof raw.dataset_id === 'string' ? raw.dataset_id : undefined,
    content: typeof raw.content === 'string' ? raw.content : undefined,
    score,
    positions: Array.isArray(raw.positions) ? (raw.positions as number[][]) : undefined,
    page_no: pageNo ?? null,
  };
}

/** 从 chunk 正文提取展示标题 */
export function extractCitationTitle(content: string, fallback: string): string {
  const body = stripCitationFrontmatter(content);

  const heading = body.match(/^#{1,6}\s+(.+)$/m);
  if (heading?.[1] && isMeaningfulTitle(heading[1])) return heading[1].trim();

  const htmlHeading = body.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i);
  if (htmlHeading?.[1]) {
    const text = stripHtmlText(htmlHeading[1]);
    if (isMeaningfulTitle(text)) return text;
  }

  if (/<table/i.test(body)) {
    const tableTitle = extractHtmlTableTitle(body);
    if (tableTitle && isMeaningfulTitle(tableTitle)) return tableTitle;
  }

  const unwrapped = unwrapParagraphWrapper(body);
  if (unwrapped.includes('|')) {
    const tableTitle = extractMarkdownTableTitle(unwrapped);
    if (tableTitle && isMeaningfulTitle(tableTitle)) return tableTitle;
  }

  const firstLine = body
    .split('\n')
    .map((line) => stripHtmlText(line.trim()))
    .find((line) => line.length > 0 && !line.startsWith('|') && isMeaningfulTitle(line));
  if (firstLine) return firstLine;

  return fallback;
}

/** 引用侧栏标题：展示 document_name */
export function resolveCitationTitle(citation: Citation, index: number): string {
  return citation.doc_name?.trim() || `来源 ${index + 1}`;
}

/** 格式化 chunk positions（RAGFlow: [页码, left, right, top, bottom]） */
export function formatCitationPositions(positions?: unknown): string | undefined {
  const pos = positions as number[][] | undefined;
  if (!pos?.length) return undefined;

  const first = pos[0];
  if (!first?.length) return undefined;

  const page = first[0];
  if (typeof page === 'number' && page > 0) {
    return `第 ${page} 页`;
  }

  return `位置 ${first.join(', ')}`;
}

/** 引用侧栏元信息：positions · 匹配度 */
export function formatCitationMeta(citation: Citation): string {
  const parts: string[] = [];
  const positionLabel = formatCitationPositions(citation.positions);
  if (positionLabel) parts.push(positionLabel);
  if (citation.score !== undefined) parts.push(`匹配 ${(citation.score * 100).toFixed(0)}%`);
  return parts.join(' · ');
}

export interface PreparedCitationContent {
  body: string;
  isHtml: boolean;
}

const HTML_CONTENT_PATTERN = /<\s*(table|thead|tbody|tr|td|th|div|p|span|ul|ol|li|h[1-6]|br)\b/i;

/** 预处理引用正文，供 Markdown / HTML 分支渲染 */
export function prepareCitationContent(content: string): PreparedCitationContent {
  const body = stripCitationFrontmatter(content);
  return {
    body,
    isHtml: HTML_CONTENT_PATTERN.test(body),
  };
}

/** 引用 HTML 仅做基础清理（内容来自可信 RAG 知识库） */
export function sanitizeCitationHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*(['"])[^'"]*\1/gi, '');
}
