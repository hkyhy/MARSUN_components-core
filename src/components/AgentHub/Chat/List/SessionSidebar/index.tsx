import { VirtualScrollbar } from '@/components/VirtualScrollbar';
import { Plus, Trash2, Undo2 } from '@/components/Icons';
import type { ChatSession } from '@/components/AgentHub/types';
import { Button, Empty, Popconfirm, Spin, Tooltip, Typography } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { formatSessionTime, getSessionDisplayName } from '../../utils/sessionMessages';
import styles from './style.module.scss';

const { Text } = Typography;

export interface SessionSidebarProps {
  title: string;
  sessions: ChatSession[];
  activeSessionId?: string;
  loading?: boolean;
  disabled?: boolean;
  onSelect: (sessionId: string) => void;
  onCreateSession: () => void;
  onClearSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

const SessionSidebar: React.FC<SessionSidebarProps> = ({
  title,
  sessions,
  activeSessionId,
  loading = false,
  disabled = false,
  onSelect,
  onCreateSession,
  onClearSession,
  onDeleteSession,
}) => (
  <div className={classNames('session-sidebar-status', styles['session-sidebar-status'])}>
    <div className={classNames('session-sidebar-info', styles['session-sidebar-info'])}>
      <Text
        strong
        className={classNames('session-sidebar-detail', styles['session-sidebar-detail'])}
        title={title}
      >
        {title}
      </Text>
      <Tooltip title="新会话">
        <Button
          type="text"
          size="small"
          icon={<Plus />}
          disabled={disabled}
          onClick={onCreateSession}
          aria-label="新会话"
          className={classNames('session-sidebar-summary', styles['session-sidebar-summary'])}
        />
      </Tooltip>
    </div>

    <VirtualScrollbar
      wrapperClassName={classNames('session-sidebar-media', styles['session-sidebar-media'])}
      className={classNames('session-sidebar-figure', styles['session-sidebar-figure'])}
    >
      {loading ? (
        <div className={classNames('session-sidebar-caption', styles['session-sidebar-caption'])}>
          <Spin size="small" />
        </div>
      ) : sessions.length === 0 ? (
        <div className={classNames('session-sidebar-divider', styles['session-sidebar-divider'])}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无历史对话"
            className={classNames('session-sidebar-block1', styles['session-sidebar-block1'])}
          />
        </div>
      ) : (
        <div className={classNames('session-sidebar-block2', styles['session-sidebar-block2'])}>
          {sessions.map((session) => {
            const active = session.id === activeSessionId;
            const displayName = getSessionDisplayName(session);
            const timeLabel =
              formatSessionTime(session.update_time ?? session.create_time) || '刚刚';

            return (
              <div
                key={session.id}
                className={classNames(
                  'session-sidebar-session-item',
                  styles['session-sidebar-session-item'],
                  active && 'session-sidebar-session-item-active',
                  active && styles['session-sidebar-session-item-active'],
                  disabled && 'session-sidebar-session-item-disabled',
                  disabled && styles['session-sidebar-session-item-disabled'],
                )}
              >
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(session.id)}
                  title={displayName}
                  className={classNames(
                    'session-sidebar-session-button',
                    styles['session-sidebar-session-button'],
                    active && 'session-sidebar-session-button-active',
                    active && styles['session-sidebar-session-button-active'],
                    disabled && 'session-sidebar-session-button-disabled',
                    disabled && styles['session-sidebar-session-button-disabled'],
                  )}
                >
                  {displayName}
                </button>

                <span
                  className={classNames('session-sidebar-block3', styles['session-sidebar-block3'])}
                >
                  {timeLabel}
                </span>

                <div
                  className={classNames('session-sidebar-block4', styles['session-sidebar-block4'])}
                >
                  <Popconfirm
                    title={active ? '确定清空当前会话内容吗？' : '确定删除该会话吗？'}
                    description={
                      active ? '清空后当前对话记录将无法恢复。' : '删除后该会话记录将无法恢复。'
                    }
                    okText={active ? '清空' : '删除'}
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                    disabled={disabled}
                    onConfirm={() =>
                      active ? onClearSession(session.id) : onDeleteSession(session.id)
                    }
                  >
                    <Tooltip title={active ? '清空' : '删除'}>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={active ? '清空' : '删除'}
                        className={classNames(
                          'session-sidebar-session-action-btn',
                          styles['session-sidebar-session-action-btn'],
                          active && 'session-sidebar-session-action-btn-active',
                          active && styles['session-sidebar-session-action-btn-active'],
                          disabled && 'session-sidebar-session-action-btn-disabled',
                          disabled && styles['session-sidebar-session-action-btn-disabled'],
                        )}
                      >
                        {active ? (
                          <Undo2
                            className={classNames(
                              'session-sidebar-block5',
                              styles['session-sidebar-block5'],
                            )}
                          />
                        ) : (
                          <Trash2
                            className={classNames(
                              'session-sidebar-block5',
                              styles['session-sidebar-block5'],
                            )}
                          />
                        )}
                      </button>
                    </Tooltip>
                  </Popconfirm>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </VirtualScrollbar>
  </div>
);

export default SessionSidebar;
