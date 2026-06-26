import { StepModal } from '@/components';
import type { StepItem } from '@/components';
import React, { useState } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

const steps: StepItem[] = [
  {
    key: 'basic',
    title: '基本信息',
    content: (
      <div className={classNames('step-modal-demo-inner', styles['step-modal-demo-inner'])}>
        <p className={classNames('step-modal-demo-header', styles['step-modal-demo-header'])}>第一步：填写基本信息</p>
        <div className={classNames('step-modal-demo-body', styles['step-modal-demo-body'])}>基本信息表单内容</div>
      </div>
    ),
  },
  {
    key: 'detail',
    title: '详细信息',
    content: () => (
      <div className={classNames('step-modal-demo-inner', styles['step-modal-demo-inner'])}>
        <p className={classNames('step-modal-demo-header', styles['step-modal-demo-header'])}>第二步：补充详细信息</p>
        <div className={classNames('step-modal-demo-body', styles['step-modal-demo-body'])}>详细信息表单内容（函数延迟求值）</div>
      </div>
    ),
  },
  {
    key: 'confirm',
    title: '确认提交',
    allowBack: true,
    content: () => (
      <div className={classNames('step-modal-demo-inner', styles['step-modal-demo-inner'])}>
        <p className={classNames('step-modal-demo-header', styles['step-modal-demo-header'])}>第三步：确认并提交</p>
        <div className={classNames('step-modal-demo-footer', styles['step-modal-demo-footer'])}>请确认以上信息无误</div>
      </div>
    ),
  },
];

const StepModalDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('basic');

  const handleOpen = () => {
    setCurrent('basic');
    setOpen(true);
  };

  return (
    <div>
      <button
        type="button"
        className={classNames('step-modal-demo-row', styles['step-modal-demo-row'])}
        onClick={handleOpen}
      >
        打开步骤弹窗
      </button>
      <StepModal
        open={open}
        current={current}
        onCancel={() => setOpen(false)}
        onStepChange={setCurrent}
        steps={steps}
        width={600}
      />
    </div>
  );
};

export default StepModalDemo;
