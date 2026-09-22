import ButtonGroup from '../../../ButtonGroup';
import { Plus } from '@/components/Icons';
import React from 'react';

export interface ManageActionButtonsProps {
  onCreateClick: () => void;
}

const ManageActionButtons: React.FC<ManageActionButtonsProps> = ({ onCreateClick }) => (
  <ButtonGroup
    list={[
      {
        children: '新建知识库',
        type: 'primary',
        icon: <Plus />,
        onClick: onCreateClick,
      },
    ]}
  />
);

export default ManageActionButtons;
