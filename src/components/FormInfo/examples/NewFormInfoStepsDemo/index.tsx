import { message } from 'antd';
import classNames from 'classnames';
import React from 'react';
import { FormInfo, FormSteps, Input, SubmitButton } from '@/form-info';
import styles from './style.module.scss';

const NewFormInfoStepsDemo: React.FC = () => (
  <div className={classNames('new-form-info-steps-demo', styles['new-form-info-steps-demo'])}>
    <FormSteps
      autoStep
      onComplete={async () => {
        message.success('向导完成');
      }}
      items={[
        {
          title: '基本信息',
          children: (
            <FormInfo
              column={1}
              list={[<Input key="name" name="name" label="姓名" rule="REQ" />]}
            />
          ),
        },
        {
          title: '确认',
          children: <FormInfo column={1} list={[<Input key="note" name="note" label="备注" />]} />,
        },
      ]}
    >
      {({ children, isLastStep }) => (
        <>
          {children}
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <SubmitButton type="primary">{isLastStep ? '完成' : '下一步'}</SubmitButton>
          </div>
        </>
      )}
    </FormSteps>
  </div>
);
export default NewFormInfoStepsDemo;
