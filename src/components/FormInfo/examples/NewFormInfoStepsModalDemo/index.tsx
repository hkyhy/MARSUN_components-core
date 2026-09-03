import { App, Button, message } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import { FormInfo, FormStepsModal, Input, useFormStepModal } from '@/form-info';
import styles from './style.module.scss';

const HookOpen: React.FC = () => {
  const openSteps = useFormStepModal();
  return (
    <Button
      onClick={() =>
        openSteps({
          modalProps: { title: 'useFormStepModal' },
          items: [
            {
              title: '一步',
              children: (
                <FormInfo column={1} list={[<Input key="x" name="x" label="X" rule="REQ" />]} />
              ),
            },
          ],
          onComplete: async () => {
            message.success('完成');
          },
        })
      }
    >
      useFormStepModal
    </Button>
  );
};

const NewFormInfoStepsModalDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <App>
      <div
        className={classNames(
          'new-form-info-steps-modal-demo',
          styles['new-form-info-steps-modal-demo'],
        )}
      >
        <Button type="primary" onClick={() => setOpen(true)} style={{ marginRight: 8 }}>
          打开 FormStepsModal
        </Button>
        <HookOpen />
        <FormStepsModal
          modalProps={{ open, title: '步骤弹窗', onCancel: () => setOpen(false) }}
          onComplete={async () => {
            message.success('提交成功');
          }}
          items={[
            {
              title: '基本',
              children: (
                <FormInfo
                  column={1}
                  list={[<Input key="name" name="name" label="姓名" rule="REQ" />]}
                />
              ),
            },
            {
              title: '确认',
              children: (
                <FormInfo column={1} list={[<Input key="note" name="note" label="备注" />]} />
              ),
            },
          ]}
        />
      </div>
    </App>
  );
};
export default NewFormInfoStepsModalDemo;
