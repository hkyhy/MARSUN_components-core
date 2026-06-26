import { Plus } from '@/components/Icons';
import { Button } from 'antd';
import React from 'react';

export interface ChatCreateButtonProps {
  onClick?: () => void;
}

const CreateButton: React.FC<ChatCreateButtonProps> = ({ onClick }) => (
  <Button type="primary" icon={<Plus />} onClick={onClick}>
    新建助手
  </Button>
);

export default CreateButton;
