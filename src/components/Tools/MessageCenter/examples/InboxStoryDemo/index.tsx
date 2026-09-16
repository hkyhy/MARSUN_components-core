import { InboxBell, type InboxBellItem, type InboxBellListParams } from '@/components/Tools/Inbox';
import {
  emitFixtureByEventKey,
  listFixtureInbox,
  markFixtureInboxRead,
  resetMsgCenterFixture,
} from '@/components/Tools/MessageCenter/doc/msgCenter.fixture';
import { Button, Space, Typography } from 'antd';
import React, { useCallback, useState } from 'react';

resetMsgCenterFixture();
emitFixtureByEventKey('energy.gap', { bizDate: '2026-09-16', count: '2' });
// maintenance.overdue 种子模板默认停用（产品：用时再启用）；故事例只 emit 已启用模板，避免模块加载抛错白屏

/** 4. 铃铛故事：同源 fixture → 已读 → href */
const InboxStoryDemo: React.FC = () => {
  const [, tick] = useState(0);
  const [log, setLog] = useState('');

  const fetchInbox = useCallback(async (params: InboxBellListParams) => {
    let list = listFixtureInbox().map((x) => ({
      id: x.id,
      title: x.title,
      summary: x.summary,
      messageType: x.messageType as InboxBellItem['messageType'],
      read: x.read,
      href: x.href,
      createdAt: x.createdAt,
    }));
    if (params.unreadOnly) list = list.filter((x) => !x.read);
    if (params.readOnly) list = list.filter((x) => x.read);
    return {
      itemList: list,
      total: list.length,
      unreadTotal: listFixtureInbox().filter((x) => !x.read).length,
      unreadByMessageType: {},
    };
  }, []);

  const markRead = useCallback(async (id: string) => {
    markFixtureInboxRead(id);
    tick((n) => n + 1);
  }, []);

  return (
    <Space orientation="vertical" size={12}>
      <Button
        size="small"
        onClick={() => {
          emitFixtureByEventKey('energy.gap', { bizDate: '2026-09-16', count: '1' });
          tick((n) => n + 1);
        }}
      >
        再 emit 一条
      </Button>
      <InboxBell
        fetchInbox={fetchInbox}
        markRead={markRead}
        onNavigate={(href, item) => setLog(`${href} · ${item.title}`)}
      />
      {log ? <Typography.Text type="secondary">跳转：{log}</Typography.Text> : null}
    </Space>
  );
};

export default InboxStoryDemo;
