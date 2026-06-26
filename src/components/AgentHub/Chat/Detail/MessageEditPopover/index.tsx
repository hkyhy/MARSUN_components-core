import { Button, Input, Popover } from 'antd';
import React, { useEffect, useMemo } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface MessageEditPopoverProps {
  open: boolean;
  value: string;
  originalContent: string;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

const MessageEditPopover: React.FC<MessageEditPopoverProps> = ({
  open,
  value,
  originalContent,
  onOpenChange,
  onChange,
  onConfirm,
  onCancel,
  children,
}) => {
  useEffect(() => {
    if (open) {
      onChange(originalContent);
    }
  }, [open, originalContent, onChange]);

  const canConfirm = useMemo(
    () => value.trim().length > 0 && value.trim() !== originalContent.trim(),
    [value, originalContent],
  );

  const content = (
    <div className={classNames('message-edit-popover-main', styles['message-edit-popover-main'])}>
      <Input.TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoSize={{ minRows: 2, maxRows: 6 }}
        placeholder="编辑消息内容"
        className={classNames('message-edit-popover-section', styles['message-edit-popover-section'])}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canConfirm) {
            e.preventDefault();
            onConfirm();
          }
        }}
      />
      <div className={classNames('message-edit-popover-group', styles['message-edit-popover-group'])}>
        <Button size="small" onClick={onCancel}>
          取消
        </Button>
        <Button type="primary" size="small" disabled={!canConfirm} onClick={onConfirm}>
          确认
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      content={content}
      trigger={[]}
      placement="bottom"
      arrow={{ pointAtCenter: true }}
      destroyOnHidden
    >
      {children}
    </Popover>
  );
};

export default MessageEditPopover;
