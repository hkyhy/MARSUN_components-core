import { describe, expect, it } from 'vitest';
import {
  normalizeAssistantMarkdown,
  normalizeDisplayText,
  parseAssistantContent,
} from '../messageContent';

const THINK_OPEN = '<' + 'think>';
const THINK_CLOSE = '<' + '/think>';

describe('parseAssistantContent', () => {
  it('shows only the final answer after the last think block', () => {
    const content = [
      '草稿分析内容',
      THINK_OPEN,
      '内部推理过程',
      THINK_CLOSE,
      '最终回答内容 [ID:0]',
    ].join('\n');

    const result = parseAssistantContent(content);
    expect(result.thinking).toBe('内部推理过程');
    expect(result.answer).toBe('最终回答内容 [ID:0]');
    expect(result.isThinking).toBe(false);
  });

  it('marks streaming state while think block is unclosed', () => {
    const content = `前置说明${THINK_OPEN}正在推理`;

    const result = parseAssistantContent(content, true);
    expect(result.isThinking).toBe(true);
    expect(result.answer).toBe('');
    expect(result.thinking).toContain('前置说明');
    expect(result.thinking).toContain('正在推理');
  });

  it('marks empty streaming as thinking', () => {
    const result = parseAssistantContent('', true);
    expect(result.isThinking).toBe(true);
    expect(result.thinking).toBe('');
    expect(result.answer).toBe('');
  });

  it('treats streaming output as thinking before ', () => {
    const content = '我们根据知识库内容回答问题。首先分析…';
    const result = parseAssistantContent(content, true);
    expect(result.isThinking).toBe(true);
    expect(result.thinking).toBe(content);
    expect(result.answer).toBe('');
  });

  it('splits thinking and answer after  while still streaming', () => {
    const content = [THINK_OPEN, '内部推理过程', THINK_CLOSE, '最终回答内容'].join('');

    const result = parseAssistantContent(content, true);
    expect(result.isThinking).toBe(false);
    expect(result.thinking).toBe('内部推理过程');
    expect(result.answer).toBe('最终回答内容');
  });

  it('returns plain content when no think tags exist', () => {
    const content = '普通回答内容';
    const result = parseAssistantContent(content);
    expect(result.thinking).toBe('');
    expect(result.answer).toBe('普通回答内容');
  });
});

describe('normalizeDisplayText', () => {
  it('trims trailing whitespace and collapses excessive newlines', () => {
    expect(normalizeDisplayText('段落一\n\n\n\n段落二   \n\n')).toBe('段落一\n\n段落二');
  });
});

describe('normalizeAssistantMarkdown', () => {
  it('inserts newline after ```mermaid when missing', () => {
    expect(normalizeAssistantMarkdown('```mermaidgraph TD\nA-->B\n```')).toBe(
      '```mermaid\ngraph TD\nA-->B\n```',
    );
  });
});
