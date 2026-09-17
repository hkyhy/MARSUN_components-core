import { InboxBell, type InboxBellItem, type InboxBellListParams } from '@/components/Tools/Inbox';
import {
  emitFixtureByEventKey,
  listFixtureInbox,
  markFixtureInboxRead,
  resetMsgCenterFixture,
} from '@/components/Tools/MessageCenter/doc/msgCenter.fixture';
import { Space, Typography } from 'antd';
import React, { useCallback, useState } from 'react';

resetMsgCenterFixture();
emitFixtureByEventKey('energy.gap', { bizDate: '2026-09-16', count: '3' });

/** Inbox 扩例：与 MessageCenter fixture 同源 */
const InboxFixtureStoryDemo: React.FC = () => {
  const [, tick] = useState(0);
  const [nav, setNav] = useState('');

  const fetchInbox = useCallback(async (_p: InboxBellListParams) => {
    const list = listFixtureInbox().map((x) => ({
      id: x.id,
      title: x.title,
      summary: x.summary,
      bodyHtml: x.bodyHtml,
      messageType: x.messageType as InboxBellItem['messageType'],
      read: x.read,
      href: x.href,
      createdAt: x.createdAt,
    }));
    return {
      itemList: list,
      total: list.length,
      unreadTotal: list.filter((x) => !x.read).length,
      unreadByMessageType: {},
    };
  }, []);

  return (
    <Space orientation="vertical">
      <Typography.Text type="secondary">
        数据来自 Tools/MessageCenter/doc fixture（energy.gap）
      </Typography.Text>
      <InboxBell
        fetchInbox={fetchInbox}
        markRead={async (id) => {
          markFixtureInboxRead(id);
          tick((n) => n + 1);
        }}
        onNavigate={(href, item) => setNav(`${href} · ${item.title}`)}
      />
      {nav ? <Typography.Text>跳转：{nav}</Typography.Text> : null}
    </Space>
  );
};

export default InboxFixtureStoryDemo;
