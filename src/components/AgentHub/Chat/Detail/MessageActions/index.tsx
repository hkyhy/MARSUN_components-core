import { Copy, Pencil, RotateCw, ThumbsDown, ThumbsUp } from '@/components/Icons';
import { Button, Tooltip } from 'antd';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';
import MessageEditPopover, { type MessageEditPopoverProps } from '../MessageEditPopover';

export type MessageActionKey = 'edit' | 'copy' | 'resend' | 'like' | 'dislike';

export interface MessageActionItem {
  key: MessageActionKey;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  hidden?: boolean;
  disabled?: boolean;
  active?: boolean;
}

export interface MessageActionsProps {
  items: MessageActionItem[];
  align?: 'left' | 'right';
  editPopover?: Omit<MessageEditPopoverProps, 'children'>;
  actionsVisible?: boolean;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  items,
  align = 'left',
  editPopover,
  actionsVisible,
}) => {
  const visibleItems = items.filter((item) => !item.hidden);
  if (visibleItems.length === 0) return null;

  return (
    <div
      className={classNames('message-actions-message-actions', styles['message-actions-message-actions'],
        actionsVisible && 'message-actions-visible',
        actionsVisible && styles['message-actions-visible'],
        align === 'right'
          ? classNames('message-actions-right', styles['message-actions-right'])
          : classNames('message-actions-left', styles['message-actions-left']),
      )}
    >
      {visibleItems.map((item) => {
        const button = (
          <Button
            type="text"
            size="small"
            icon={item.icon}
            disabled={item.disabled}
            onClick={item.onClick}
            className={classNames('message-actions-message-action-btn', styles['message-actions-message-action-btn'],
              item.active
                ? classNames('message-actions-message-action-btn-active', styles['message-actions-message-action-btn-active'])
                : classNames('message-actions-message-action-btn-default', styles['message-actions-message-action-btn-default']),
            )}
            aria-label={item.label}
            aria-pressed={item.active}
          />
        );

        if (item.key === 'edit' && editPopover) {
          return (
            <MessageEditPopover key={item.key} {...editPopover}>
              <span className={classNames('message-actions-message-action-btn-wrap', styles['message-actions-message-action-btn-wrap'])}>
                <Tooltip title={item.label}>{button}</Tooltip>
              </span>
            </MessageEditPopover>
          );
        }

        return (
          <Tooltip key={item.key} title={item.label}>
            {button}
          </Tooltip>
        );
      })}
    </div>
  );
};

export const createUserMessageActions = (options: {
  onEdit?: () => void;
  onCopy: () => void;
  onResend?: () => void;
  editDisabled?: boolean;
}): MessageActionItem[] => [
  {
    key: 'edit',
    label: '重新编辑',
    icon: <Pencil />,
    onClick: options.onEdit ?? (() => {}),
    hidden: !options.onEdit,
    disabled: options.editDisabled,
  },
  {
    key: 'copy',
    label: '复制',
    icon: <Copy />,
    onClick: options.onCopy,
  },
  {
    key: 'resend',
    label: '重新发送',
    icon: <RotateCw />,
    onClick: options.onResend ?? (() => {}),
    hidden: !options.onResend,
  },
];

export const createAssistantMessageActions = (options: {
  onCopy: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  thumbup?: boolean | null;
  feedbackDisabled?: boolean;
}): MessageActionItem[] => [
  {
    key: 'like',
    label: '赞',
    icon: <ThumbsUp />,
    onClick: options.onLike ?? (() => {}),
    hidden: !options.onLike,
    disabled: options.feedbackDisabled,
    active: options.thumbup === true,
  },
  {
    key: 'dislike',
    label: '踩',
    icon: <ThumbsDown />,
    onClick: options.onDislike ?? (() => {}),
    hidden: !options.onDislike,
    disabled: options.feedbackDisabled,
    active: options.thumbup === false,
  },
  {
    key: 'copy',
    label: '复制',
    icon: <Copy />,
    onClick: options.onCopy,
  },
];

export default MessageActions;
