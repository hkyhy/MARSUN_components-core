import MessageItem from '@/components/AgentHub/Chat/Detail/MessageItem';
import React from 'react';
import {
  mockAssistantMessage,
  mockAssistantWidgetMessage,
  mockStreamingMessage,
  mockUserMessage,
} from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const MessageItemBasicDemo: React.FC = () => (
  <div
    className={classNames(
      'message-item-basic-demo-block21',
      styles['message-item-basic-demo-block21'],
    )}
  >
    <MessageItem message={mockUserMessage} onEditMessage={() => {}} onResendMessage={() => {}} />
    <MessageItem message={mockAssistantMessage} onCitationClick={() => {}} />
    <MessageItem message={mockAssistantWidgetMessage} />
    <MessageItem message={mockStreamingMessage} />
  </div>
);

export default MessageItemBasicDemo;
