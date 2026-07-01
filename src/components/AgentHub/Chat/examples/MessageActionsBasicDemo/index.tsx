import MessageActions from '@/components/AgentHub/Chat/Detail/MessageActions';
import { Copy, Pencil, RotateCw, ThumbsDown, ThumbsUp } from '@/components/Icons';
import classNames from 'classnames';
import React, { useState } from 'react';
import styles from './style.module.scss';

const MessageActionsBasicDemo: React.FC = () => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  return (
    <div className={classNames('message-actions-basic-demo-root', styles['message-actions-basic-demo-root'])}>
      <MessageActions
        align="right"
        items={[
          {
            key: 'edit',
            label: '编辑',
            icon: <Pencil size={14} />,
            onClick: () => undefined,
          },
          {
            key: 'copy',
            label: '复制',
            icon: <Copy size={14} />,
            onClick: () => undefined,
          },
          {
            key: 'resend',
            label: '重新发送',
            icon: <RotateCw size={14} />,
            onClick: () => undefined,
          },
          {
            key: 'like',
            label: '有帮助',
            icon: <ThumbsUp size={14} />,
            onClick: () => {
              setLiked((v) => !v);
              setDisliked(false);
            },
            active: liked,
          },
          {
            key: 'dislike',
            label: '没帮助',
            icon: <ThumbsDown size={14} />,
            onClick: () => {
              setDisliked((v) => !v);
              setLiked(false);
            },
            active: disliked,
          },
        ]}
      />
    </div>
  );
};

export default MessageActionsBasicDemo;
