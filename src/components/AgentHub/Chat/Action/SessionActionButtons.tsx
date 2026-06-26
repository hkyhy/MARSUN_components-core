import { Trash2 } from '@/components/Icons';
import ButtonGroup from '@kne/button-group';
import React from 'react';

export interface SessionActionButtonsProps {
  streaming?: boolean;
  clearDisabled?: boolean;
  onClearConversation: () => void;
}

const SessionActionButtons: React.FC<SessionActionButtonsProps> = ({
  streaming = false,
  clearDisabled = false,
  onClearConversation,
}) => (
  <ButtonGroup
    list={[
      {
        children: '清空对话',
        icon: <Trash2 />,
        disabled: streaming || clearDisabled,
        onClick: onClearConversation,
      },
    ]}
  />
);

export default SessionActionButtons;
