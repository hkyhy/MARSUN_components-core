/** Demo 共用候选人假数据（对齐上游 flex-box/doc） */
export type CandidateItem = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'running' | 'check' | 'ended';
  invitedAt: string;
  remark?: string;
  score?: number;
};

export const candidates: CandidateItem[] = [
  {
    id: '327708204249121792',
    code: 'EC8901',
    name: 'luna.zhang',
    email: 'luna.zhang@leapin.io',
    phone: '+86 17621655346',
    status: 'pending',
    invitedAt: '2026-06-23 15:14',
  },
  {
    id: '327708204249121801',
    code: 'EC8902',
    name: 'wei.chen',
    email: 'wei.chen@leapin.io',
    phone: '+86 13800138000',
    status: 'running',
    invitedAt: '2026-06-22 09:40',
    remark:
      '已进入面试间，当前正在回答第二题。候选人补充了项目经历，卡片内容比「未开始」状态更长。',
  },
  {
    id: '327708204249121810',
    code: 'EC8903',
    name: 'ming.li',
    email: 'ming.li@leapin.io',
    phone: '+86 13912345678',
    status: 'ended',
    invitedAt: '2026-06-20 11:02',
    score: 86,
  },
  {
    id: '327708204249121819',
    code: 'EC8904',
    name: 'yan.wu',
    email: 'yan.wu@leapin.io',
    phone: '+86 18600001111',
    status: 'pending',
    invitedAt: '2026-06-19 18:20',
  },
  {
    id: '327708204249121828',
    code: 'EC8905',
    name: 'hao.zhou',
    email: 'hao.zhou@leapin.io',
    phone: '+86 15012344321',
    status: 'check',
    invitedAt: '2026-06-18 10:05',
    remark: '报告待复核：疑似切屏，需要面试官确认后再发 offer。',
  },
  {
    id: '327708204249121837',
    code: 'EC8906',
    name: 'qing.sun',
    email: 'qing.sun@leapin.io',
    phone: '+86 13188886666',
    status: 'ended',
    invitedAt: '2026-06-17 14:33',
    score: 72,
  },
];

export const statusMap: Record<string, { color: string; text: string }> = {
  pending: { color: 'default', text: '未开始' },
  running: { color: 'processing', text: '进行中' },
  check: { color: 'error', text: '待复核' },
  ended: { color: 'success', text: '已完成' },
};
