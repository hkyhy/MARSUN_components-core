const THINK_OPEN = '<' + 'think>';
const THINK_CLOSE = '<' + '/think>';
const THINK_BLOCK_RE = new RegExp(
  THINK_OPEN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '([\\s\\S]*?)' +
    THINK_CLOSE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  'gi',
);
const THINK_TAG_RE = /<\/?think>/gi;

export interface ParsedAssistantContent {
  /** Reasoning text extracted from think blocks */
  thinking: string;
  /** User-facing answer (outside think blocks) */
  answer: string;
  /** Stream still inside an unclosed think block */
  isThinking: boolean;
}

/** Collapse excessive blank lines and trim trailing whitespace for display */
export function normalizeDisplayText(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n').trimEnd();
}

const CITATION_MARKER_TEST_RE = /\[ID[:-]\d+\]/;

/** Normalize assistant markdown from persisted sessions (fences, mermaid blocks). */
export function normalizeAssistantMarkdown(content: string): string {
  if (!content) return content;

  let text = content.replace(/\r\n/g, '\n');

  // Ensure newline after ```mermaid opening fence
  text = text.replace(/```\s*mermaid[ \t]*(?!\n)/gi, '```mermaid\n');

  // Move trailing prose after mermaid block out of the fence when closing ``` is missing
  text = text.replace(
    /```mermaid\n([\s\S]*?)(\n(?:风格说明|Style)[^\n`]*[\s\S]*?)(?=```|$)/gi,
    (_, chart, prose) => {
      const trimmedChart = chart.trimEnd();
      return `\`\`\`mermaid\n${trimmedChart}\n\`\`\`\n${prose.trim()}`;
    },
  );

  return text;
}

export function hasCitationMarkers(content: string): boolean {
  return CITATION_MARKER_TEST_RE.test(content);
}

/**
 * Split assistant output into hidden reasoning and visible answer.
 * RAGFlow / reasoning models may wrap chain-of-thought in think tags.
 */
export function parseAssistantContent(content: string, streaming = false): ParsedAssistantContent {
  if (!content) {
    return { thinking: '', answer: '', isThinking: streaming };
  }

  const lower = content.toLowerCase();
  const lastClose = lower.lastIndexOf(THINK_CLOSE);
  const lastOpen = lower.lastIndexOf(THINK_OPEN);

  const thinkingParts: string[] = [];
  for (const match of content.matchAll(THINK_BLOCK_RE)) {
    const part = match[1]?.trim();
    if (part) thinkingParts.push(part);
  }

  // Streaming: before  arrives, treat all output as reasoning
  if (streaming && lastClose === -1) {
    return {
      thinking: normalizeDisplayText(content.replace(THINK_TAG_RE, '').trim()),
      answer: '',
      isThinking: true,
    };
  }

  // Streaming: unclosed think block at the end
  if (lastOpen > lastClose) {
    const beforeOpen = content.slice(0, lastOpen).replace(THINK_TAG_RE, '').trim();
    const insideThink = content
      .slice(lastOpen + THINK_OPEN.length)
      .replace(THINK_TAG_RE, '')
      .trim();
    const thinking = [
      ...(beforeOpen ? [beforeOpen] : []),
      ...thinkingParts,
      ...(insideThink ? [insideThink] : []),
    ].join('\n\n');

    return {
      thinking: normalizeDisplayText(thinking),
      answer: '',
      isThinking: streaming,
    };
  }

  // Prefer final answer after the last closing think tag
  if (lastClose !== -1) {
    const answer = normalizeDisplayText(
      content
        .slice(lastClose + THINK_CLOSE.length)
        .replace(THINK_TAG_RE, '')
        .trim(),
    );
    if (answer) {
      return {
        thinking: normalizeDisplayText(thinkingParts.join('\n\n')),
        answer,
        isThinking: false,
      };
    }
  }

  const answer = normalizeDisplayText(
    content.replace(THINK_BLOCK_RE, '').replace(THINK_TAG_RE, '').trim(),
  );

  return {
    thinking: normalizeDisplayText(thinkingParts.join('\n\n')),
    answer,
    isThinking: false,
  };
}
