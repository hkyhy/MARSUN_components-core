import { SEMANTIC_COLORS, SemanticTag } from '@/components';
import type { ChatAssistant, Dataset } from '@/components/AgentHub/types';
import { Bot } from '@/components/Icons';
import ButtonGroup from '@kne/button-group';
import { Tooltip, Typography } from 'antd';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

const { Text, Paragraph } = Typography;

export interface ChatCardProps {
  chat: ChatAssistant;
  datasets: Dataset[];
  onStartChat: (chat: ChatAssistant) => void;
  onEdit: (chat: ChatAssistant) => void;
  onDelete: (chat: ChatAssistant) => void;
}

const ChatCard: React.FC<ChatCardProps> = ({ chat, datasets, onStartChat, onEdit, onDelete }) => {
  const linkedKBs = chat.dataset_ids
    ?.map((id) => datasets.find((d) => d.id === id)?.name ?? id)
    .filter(Boolean);

  const isActive = chat.status === '1';

  return (
    <div className={classNames('group', 'chat-card', styles['chat-card-chat-card'])} onClick={() => onStartChat(chat)}>
      <div className={classNames('chat-card-header', styles['chat-card-header'])}>
        <div className={classNames('chat-card-avatar', styles['chat-card-avatar'], 'bg-primary')}>
          <Bot className={classNames('chat-card-avatar-icon', styles['chat-card-avatar-icon'])} />
        </div>
        <div className={classNames('chat-card-title-wrap', styles['chat-card-title-wrap'])}>
          <Tooltip title={chat.name}>
            <Text strong className={classNames('chat-card-title', styles['chat-card-title'])} style={{ lineHeight: '1.4' }}>
              {chat.name}
            </Text>
          </Tooltip>
          <div className={classNames('chat-card-status-row', styles['chat-card-status-row'])}>
            <span
              className={classNames('chat-card-status-dot', styles['chat-card-status-dot'],
                isActive
                  ? classNames('chat-card-status-dot-active', styles['chat-card-status-dot-active'])
                  : classNames('chat-card-status-dot-inactive', styles['chat-card-status-dot-inactive']),
              )}
            />
            <Text
              className={
                isActive
                  ? classNames('chat-card-status-text-active', styles['chat-card-status-text-active'])
                  : classNames('chat-card-status-text-inactive', styles['chat-card-status-text-inactive'])
              }
            >
              {isActive ? '已启用' : '未启用'}
            </Text>
          </div>
        </div>
      </div>

      <div className={classNames('chat-card-body', styles['chat-card-body'])}>
        <Paragraph type="secondary" className={classNames('chat-card-desc', styles['chat-card-desc'])} ellipsis={{ rows: 2 }}>
          {chat.description || chat.prompt_config?.prologue || '暂无描述'}
        </Paragraph>

        <div className={classNames('chat-card-tags', styles['chat-card-tags'])}>
          {linkedKBs && linkedKBs.length > 0 ? (
            <div className={classNames('chat-card-tag-list', styles['chat-card-tag-list'])}>
              {linkedKBs.slice(0, 3).map((kb) => (
                <SemanticTag key={kb} color={SEMANTIC_COLORS.SUCCESS} className={classNames('chat-card-tag', styles['chat-card-tag'])}>
                  {kb}
                </SemanticTag>
              ))}
              {linkedKBs.length > 3 && (
                <SemanticTag color={SEMANTIC_COLORS.DEFAULT} className={classNames('chat-card-tag', styles['chat-card-tag'])}>
                  +{linkedKBs.length - 3}
                </SemanticTag>
              )}
            </div>
          ) : (
            <Text type="secondary" className={classNames('chat-card-empty-kb', styles['chat-card-empty-kb'])}>
              未关联知识库
            </Text>
          )}
        </div>
      </div>

      <div className={classNames('chat-card-footer', styles['chat-card-footer'])} onClick={(e) => e.stopPropagation()}>
        <ButtonGroup
          moreType="link"
          showLength={1}
          list={[
            {
              children: '开始对话',
              type: 'link',
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                onStartChat(chat);
              },
            },
            {
              children: '编辑',
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                onEdit(chat);
              },
            },
            {
              children: '删除',
              danger: true,
              message: `确认删除助手「${chat.name}」？`,
              isDelete: true,
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                onDelete(chat);
              },
            },
          ]}
        />
      </div>
    </div>
  );
};

export default ChatCard;
