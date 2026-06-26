import type { ChatMessage } from '@/components/AgentHub/types';
import { describe, expect, it } from 'vitest';
import { normalizeCitation } from '../citationContent';
import {
  getSessionDisplayName,
  isWelcomeOnlyMessages,
  normalizeMessageContent,
  parseSessionMessages,
  toDisplayMessages,
} from '../sessionMessages';

describe('sessionMessages', () => {
  it('parses session messages with citations from reference array', () => {
    const messages = parseSessionMessages(
      [
        { id: 'm1', role: 'assistant', content: '你好' },
        { id: 'm2', role: 'user', content: '价格是多少？' },
        { id: 'm3', role: 'assistant', content: '请参考文档' },
      ],
      [{}, {}, { chunks: [{ doc_name: 'pricing.pdf', content: '99元' }] }],
    );

    expect(messages).toHaveLength(3);
    expect(messages[2].citations).toEqual([
      normalizeCitation({ doc_name: 'pricing.pdf', content: '99元' }),
    ]);
  });

  it('normalizes non-string message content', () => {
    expect(normalizeMessageContent(12)).toBe('12');
    expect(normalizeMessageContent([{ type: 'text', text: '你好' }])).toBe('你好');
    expect(normalizeMessageContent({ content: '回答正文' })).toBe('回答正文');
  });

  it('sorts messages chronologically when created_at is descending', () => {
    const messages = parseSessionMessages(
      [
        { role: 'user', content: '最新问题', created_at: 300 },
        { role: 'assistant', content: '开场白', created_at: 100 },
        { role: 'user', content: '第一个问题', created_at: 200 },
      ],
      [],
    );

    expect(messages.map((item) => item.content)).toEqual(['开场白', '第一个问题', '最新问题']);
  });

  it('strips prologue from multi-message sessions', () => {
    const prologue = '你好！我是你的助理，有什么可以帮到你的吗？';
    const parsed = parseSessionMessages(
      [
        { role: 'assistant', content: prologue, created_at: 1 },
        { role: 'user', content: '最好的长绒棉是什么？', created_at: 2 },
        { role: 'assistant', content: '长绒棉是……', created_at: 3 },
      ],
      [],
    );

    const display = toDisplayMessages(parsed, prologue);
    expect(display).toHaveLength(2);
    expect(display[0]?.content).toBe('最好的长绒棉是什么？');
    expect(display[1]?.content).toBe('长绒棉是……');
  });

  it('filters duplicate spurious numeric-only user messages', () => {
    const prologue = '你好！我是你的助理，有什么可以帮到你的吗？';
    const parsed = parseSessionMessages(
      [
        { role: 'assistant', content: prologue, created_at: 1 },
        { role: 'user', content: '最好的长绒棉是什么？', created_at: 2 },
        { role: 'user', content: '12', created_at: 3 },
        { role: 'user', content: '12', created_at: 4 },
        { role: 'assistant', content: '长绒棉是……', created_at: 5 },
      ],
      [],
    );

    const display = toDisplayMessages(parsed, prologue);
    expect(display.map((item) => item.content)).toEqual(['最好的长绒棉是什么？', '长绒棉是……']);
  });

  it('keeps unique short numeric user follow-ups such as 22 and 11', () => {
    const prologue = '你好！ 我是你的助理，有什么可以帮到你的吗？';
    const parsed = parseSessionMessages(
      [
        { role: 'assistant', content: prologue },
        { id: 'u1', role: 'user', content: '精梳棉流程是什么？' },
        { id: 'u1', role: 'assistant', content: '流程说明' },
        { id: 'u2', role: 'user', content: '22' },
        { id: 'u2', role: 'assistant', content: '关于22的说明' },
        { id: 'u3', role: 'user', content: '11' },
        { id: 'u3', role: 'assistant', content: '关于11的说明' },
      ],
      [],
    );

    const display = toDisplayMessages(parsed, prologue);
    expect(display.map((item) => `${item.role}:${item.content}`)).toEqual([
      'user:精梳棉流程是什么？',
      'assistant:流程说明',
      'user:22',
      'assistant:关于22的说明',
      'user:11',
      'assistant:关于11的说明',
    ]);
  });

  it('treats prologue-only session as welcome state', () => {
    const messages: ChatMessage[] = [
      { id: 'm1', role: 'assistant', content: '欢迎使用知识库问答' },
    ];

    expect(isWelcomeOnlyMessages(messages, '欢迎使用知识库问答')).toBe(true);
    expect(toDisplayMessages(messages, '欢迎使用知识库问答')).toEqual([]);
  });

  it('treats assistant-only session as welcome even without prologue config', () => {
    const messages: ChatMessage[] = [
      { id: 'm1', role: 'assistant', content: '你好！我是你的助理，有什么可以帮到你的吗？' },
    ];

    expect(toDisplayMessages(messages)).toEqual([]);
  });

  it('derives display name from first user message', () => {
    expect(
      getSessionDisplayName({
        id: 's1',
        chat_id: 'c1',
        name: '新会话',
        messages: [{ id: 'm1', role: 'user', content: '请介绍一下产品定价策略' }],
      }),
    ).toBe('请介绍一下产品定价策略');
  });

  it('falls back to session-wide citations when reference index is misaligned', () => {
    const chunks = Array.from({ length: 8 }, (_, i) => ({
      doc_name: `doc-${i}.pdf`,
      content: `chunk ${i}`,
    }));

    const messages = parseSessionMessages(
      [
        { id: 'm1', role: 'user', content: '问题' },
        {
          id: 'm2',
          role: 'assistant',
          content: '根据知识库[ID:5]说明流程 [ID:0]',
        },
      ],
      [{}, {}],
    );

    expect(messages[1]?.citations).toBeUndefined();

    const fixed = parseSessionMessages(
      [
        { id: 'm1', role: 'user', content: '问题' },
        {
          id: 'm2',
          role: 'assistant',
          content: '根据知识库[ID:5]说明流程 [ID:0]',
        },
      ],
      [{}, { chunks }],
    );

    expect(fixed[1]?.citations).toHaveLength(8);
  });

  it('reads citations attached on the message object', () => {
    const messages = parseSessionMessages(
      [
        {
          id: 'm1',
          role: 'assistant',
          content: '回答 [ID:1]',
          reference: { chunks: [{ doc_name: 'a.pdf', content: 'A' }] },
        },
      ],
      [],
    );

    expect(messages[0]?.citations).toEqual([
      normalizeCitation({ doc_name: 'a.pdf', content: 'A' }),
    ]);
  });

  it('preserves API order when only assistant replies have created_at', () => {
    const prologue = '你好！ 我是你的助理，有什么可以帮到你的吗？';
    const parsed = parseSessionMessages(
      [
        { role: 'assistant', content: prologue },
        { id: 'turn-1', role: 'user', content: '你好' },
        {
          id: 'turn-1',
          role: 'assistant',
          content: '在知识库中未能找到您要的内容',
          created_at: 1781506828.559062,
        },
        { id: 'turn-2', role: 'user', content: '今天天气' },
        {
          id: 'turn-2',
          role: 'assistant',
          content: '在知识库中未能找到您要的内容',
          created_at: 1781506837.5843554,
        },
      ],
      [],
    );

    expect(parsed.map((item) => `${item.role}:${item.content}`)).toEqual([
      'assistant:你好！ 我是你的助理，有什么可以帮到你的吗？',
      'user:你好',
      'assistant:在知识库中未能找到您要的内容',
      'user:今天天气',
      'assistant:在知识库中未能找到您要的内容',
    ]);

    const display = toDisplayMessages(parsed, prologue);
    expect(display.map((item) => `${item.role}:${item.content}`)).toEqual([
      'user:你好',
      'assistant:在知识库中未能找到您要的内容',
      'user:今天天气',
      'assistant:在知识库中未能找到您要的内容',
    ]);
  });

  it('does not attach turn-aligned references to user messages', () => {
    const chunks = Array.from({ length: 8 }, (_, i) => ({
      doc_name: `doc-${i}.pdf`,
      content: `chunk ${i}`,
    }));

    const messages = parseSessionMessages(
      [
        { role: 'assistant', content: '你好！我是助理' },
        { id: 'u1', role: 'user', content: '精梳棉流程是什么' },
        { id: 'u1', role: 'assistant', content: '流程说明 [ID:0]' },
        { id: 'u2', role: 'user', content: '使用mermaid' },
        { id: 'u2', role: 'assistant', content: 'mermaid 图' },
      ],
      [{ chunks }, { chunks: [] }],
    );

    expect(messages[1]?.citations).toBeUndefined();
    expect(messages[2]?.citations).toHaveLength(8);
    expect(messages[3]?.citations).toBeUndefined();
  });

  it('reads citations when chunks are stored as a dict keyed by index', () => {
    const messages = parseSessionMessages(
      [
        {
          id: 'm1',
          role: 'assistant',
          content: '回答 [ID:12]',
          reference: {
            chunks: {
              '12': { doc_name: 'cotton.pdf', content: '长绒棉说明' },
            },
          },
        },
      ],
      [],
    );

    expect(messages[0]?.citations).toEqual([
      normalizeCitation({ doc_name: 'cotton.pdf', content: '长绒棉说明' }),
    ]);
  });

  it('normalizes RAGFlow chunk fields when parsing citations', () => {
    const messages = parseSessionMessages(
      [
        { id: 'm1', role: 'assistant', content: '你好' },
        { id: 'm2', role: 'user', content: '隔距是多少？' },
        { id: 'm3', role: 'assistant', content: '请参考文档' },
      ],
      [
        {},
        {},
        {
          chunks: [
            {
              document_name: '纺织入门妙妙屋/02-纺纱工艺/精梳工序概述.md',
              document_id: 'f9e79c1a64b011f189ab7be4233b4fad',
              content: '<table><tbody><tr><td>隔距(mm)</td><td>8.0</td></tr></tbody></table>',
              similarity: 0.6026360624285714,
            },
          ],
        },
      ],
    );

    expect(messages[2].citations?.[0]).toEqual({
      id: undefined,
      doc_id: 'f9e79c1a64b011f189ab7be4233b4fad',
      doc_name: '纺织入门妙妙屋/02-纺纱工艺/精梳工序概述.md',
      dataset_id: undefined,
      content: '<table><tbody><tr><td>隔距(mm)</td><td>8.0</td></tr></tbody></table>',
      score: 0.6026360624285714,
      positions: undefined,
      page_no: null,
    });
  });
});
