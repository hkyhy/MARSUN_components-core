import type { ChatAssistant, ChatMessage, ChatSession, Citation, Dataset } from '@/components/AgentHub/types';

export const mockDatasets: Dataset[] = [
  {
    id: 'kb-1',
    name: '企业制度手册',
    description: '包含考勤、休假、报销等制度文档',
    chunk_count: 1280,
    document_count: 24,
    token_num: 520000,
  },
  {
    id: 'kb-2',
    name: '产品技术文档',
    description: 'API 文档与架构设计说明',
    chunk_count: 860,
    document_count: 12,
    token_num: 310000,
  },
  {
    id: 'kb-3',
    name: '客户服务 FAQ',
    description: '常见问题与标准回复话术',
    chunk_count: 420,
    document_count: 8,
    token_num: 98000,
  },
];

export const mockChatAssistants: ChatAssistant[] = [
  {
    id: 'chat-1',
    name: '制度问答助手',
    description: '基于企业制度知识库，解答考勤、休假、报销等问题',
    status: '1',
    dataset_ids: ['kb-1', 'kb-3'],
    prompt_config: { prologue: '您好，我是制度问答助手，有什么可以帮您？' },
  },
  {
    id: 'chat-2',
    name: '技术支持助手',
    description: '解答产品 API 与集成相关问题',
    status: '1',
    dataset_ids: ['kb-2'],
    prompt_config: { prologue: '您好，我是技术支持助手。' },
  },
  {
    id: 'chat-3',
    name: '草稿助手',
    description: '尚未配置知识库',
    status: '0',
    dataset_ids: [],
  },
];

export const mockCitations: Citation[] = [
  {
    id: 'cite-1',
    doc_id: 'doc-1',
    doc_name: '员工休假管理制度.pdf',
    content:
      '正式员工每年享有带薪年假，工龄满 1 年不满 10 年的，年休假 5 天；满 10 年不满 20 年的，年休假 10 天；满 20 年的，年休假 15 天。',
    score: 0.92,
    page_no: 3,
  },
  {
    id: 'cite-2',
    doc_id: 'doc-2',
    doc_name: '考勤管理办法.pdf',
    content:
      '员工请假须提前在 OA 系统提交申请，3 天以内由直属主管审批，3 天以上需部门负责人审批。',
    score: 0.78,
    page_no: 7,
  },
];

export const mockUserMessage: ChatMessage = {
  id: 'msg-1',
  role: 'user',
  content: '请问正式员工的年假有多少天？',
};

export const mockAssistantMessage: ChatMessage = {
  id: 'msg-2',
  role: 'assistant',
  content:
    '根据企业制度，正式员工的年假天数与工龄相关：[ID:1]\n\n- 工龄 1-10 年：5 天\n- 工龄 10-20 年：10 天\n- 工龄 20 年以上：15 天\n\n以下是精梳棉流程的 Mermaid 流程图：\n\n```mermaid\ngraph LR\n    A[梳棉生条] --> B[并条机（预并）]\n    B --> C[条并联合机（条卷）]\n    C --> D[精梳机]\n    D --> E[精梳条]\n    E --> F[并条]\n```\n\n请假流程请参考考勤规定 [ID:2]。',
  citations: mockCitations,
};

export const mockStreamingMessage: ChatMessage = {
  id: 'msg-3',
  role: 'assistant',
  content: '',
  streaming: true,
};

export const mockChatSessions: ChatSession[] = [
  {
    id: 'sess-1',
    chat_id: 'chat-1',
    name: '新会话',
    messages: [{ id: 'm1', role: 'user', content: '请问正式员工的年假有多少天？' }],
    create_time: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    update_time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'sess-2',
    chat_id: 'chat-1',
    name: '新会话',
    messages: [{ id: 'm2', role: 'user', content: '报销流程需要哪些材料？' }],
    create_time: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    update_time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'sess-3',
    chat_id: 'chat-1',
    name: '考勤制度咨询',
    messages: [{ id: 'm3', role: 'user', content: '迟到 30 分钟怎么算？' }],
    create_time: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    update_time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];
