import { App, Button, message } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import { FormInfo, FormModal, Input, useFormModal } from '@/form-info';
import styles from './style.module.scss';

const HookOpen: React.FC = () => {
  const formModal = useFormModal();
  return (
    <Button
      onClick={() =>
        formModal({
          title: 'useFormModal',
          formProps: {
            onSubmit: async (data: Record<string, unknown>) => {
              message.success(String(data.name ?? ''));
            },
          },
          children: (
            <FormInfo
              column={1}
              list={[<Input key="name" name="name" label="姓名" rule="REQ" />]}
            />
          ),
        })
      }
    >
      useFormModal 打开
    </Button>
  );
};

const NewFormInfoModalDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <App>
      <div className={classNames('new-form-info-modal-demo', styles['new-form-info-modal-demo'])}>
        <Button type="primary" onClick={() => setOpen(true)} style={{ marginRight: 8 }}>
          受控 FormModal
        </Button>
        <HookOpen />
        <FormModal
          title="编辑（新栈）"
          open={open}
          onCancel={() => setOpen(false)}
          formProps={{
            data: { name: '李四' },
            onSubmit: async () => {
              message.success('已保存');
            },
          }}
          autoClose
        >
          <FormInfo column={1} list={[<Input key="name" name="name" label="姓名" rule="REQ" />]} />
        </FormModal>
      </div>
    </App>
  );
};
export default NewFormInfoModalDemo;
