import { Plus } from '@/components/Icons';
import ButtonGroup from '../../../ButtonGroup';
import React from 'react';

export interface ChatManageActionButtonsProps {
  onCreateClick: () => void;
}

const ManageActionButtons: React.FC<ChatManageActionButtonsProps> = ({ onCreateClick }) => (
  <ButtonGroup
    list={[
      {
        children: '新建助手',
        type: 'primary',
        icon: <Plus />,
        onClick: onCreateClick,
      },
    ]}
  />
);

export default ManageActionButtons;
