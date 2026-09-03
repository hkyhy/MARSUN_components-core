import { App, Button, message } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import { FormDrawer, FormInfo, Input, useFormDrawer } from '@/form-info';
import styles from './style.module.scss';

const HookOpen: React.FC = () => {
  const formDrawer = useFormDrawer();
  return (
    <Button
      onClick={() =>
        formDrawer({
          title: 'useFormDrawer',
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
      useFormDrawer 打开
    </Button>
  );
};

const NewFormInfoDrawerDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <App>
      <div className={classNames('new-form-info-drawer-demo', styles['new-form-info-drawer-demo'])}>
        <Button type="primary" onClick={() => setOpen(true)} style={{ marginRight: 8 }}>
          受控 FormDrawer
        </Button>
        <HookOpen />
        <FormDrawer
          title="抽屉表单（新栈）"
          open={open}
          onCancel={() => setOpen(false)}
          placement="right"
          formProps={{
            onSubmit: async () => {
              message.success('已保存');
            },
          }}
          autoClose
        >
          <FormInfo column={1} list={[<Input key="name" name="name" label="姓名" rule="REQ" />]} />
        </FormDrawer>
      </div>
    </App>
  );
};
export default NewFormInfoDrawerDemo;
