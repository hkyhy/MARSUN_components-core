import { InboxBell, type InboxBellItem, type InboxBellListParams } from '@/components/Tools/Inbox';
import { Space, Switch } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';

const SEED: InboxBellItem[] = [
  {
    id: '1',
    title: '用能缺口巡检命中',
    summary: '业务日 2026-09-16 · 共 3 台',
    messageType: 'alert',
    read: false,
    href: '/energy',
    createdAt: '2026-09-16 08:00',
  },
  {
    id: '2',
    title: '保养超期提醒',
    summary: '机台 M-01 已超期',
    messageType: 'remind',
    read: true,
    href: '/maintenance',
    createdAt: '2026-09-15 18:00',
  },
];

/** InboxBell Demo：本地内存数据，演示列表 / 已读 / Tab / 角标 */
const InboxBellDemo: React.FC = () => {
  const [rows, setRows] = useState(SEED);
  const [log, setLog] = useState('');
  const [poll, setPoll] = useState(false);

  const fetchInbox = useCallback(
    async (params: InboxBellListParams) => {
      let list = [...rows];
      if (params.messageType) list = list.filter((x) => x.messageType === params.messageType);
      if (params.unreadOnly) list = list.filter((x) => !x.read);
      if (params.readOnly) list = list.filter((x) => x.read);
      const unreadByMessageType = rows.reduce<Record<string, number>>((acc, x) => {
        if (!x.read) {
          const k = String(x.messageType || 'alert');
          acc[k] = (acc[k] || 0) + 1;
        }
        return acc;
      }, {});
      return {
        itemList: list,
        total: list.length,
        unreadTotal: rows.filter((x) => !x.read).length,
        unreadByMessageType,
      };
    },
    [rows],
  );

  const markRead = useCallback(async (id: string) => {
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)));
  }, []);

  const onNavigate = useCallback((href: string, item: InboxBellItem) => {
    setLog(`navigate ${href} · ${item.title}`);
  }, []);

  const pollMs = useMemo(() => (poll ? 30_000 : 0), [poll]);

  return (
    <Space direction="vertical" size={12}>
      <Space>
        <span>轮询角标</span>
        <Switch checked={poll} onChange={setPoll} size="small" />
        {log ? <span>{log}</span> : null}
      </Space>
      <InboxBell
        fetchInbox={fetchInbox}
        markRead={markRead}
        onNavigate={onNavigate}
        pollMs={pollMs}
      />
    </Space>
  );
};

export default InboxBellDemo;
