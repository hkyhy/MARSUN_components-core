import { useState } from 'react';
import { FormInfo, FormModal, TextArea } from '../../../FormInfo';
import classNames from 'classnames';
import styles from './CancelExecutionModal.module.scss';

export type CancelExecutionModalProps = {
  open: boolean;
  /** 有目标才真正打开 */
  hasTarget?: boolean;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (cancelReason: string) => Promise<void>;
  title?: string;
  okText?: string;
  hint?: string;
  placeholder?: string;
  className?: string;
};

export function CancelExecutionForm({
  hint = '取消后任务进入「已取消」；重新打开前须说明原因。',
  placeholder = '请填写取消执行的理由',
}: {
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div className={classNames('cancel-execution-form', styles['cancel-execution-form'])}>
      <p className={styles['cancel-execution-form-hint']}>{hint}</p>
      <FormInfo
        column={1}
        list={[
          <TextArea
            key="cancelReason"
            name="cancelReason"
            label="取消理由"
            rule="REQ"
            rows={3}
            block
            placeholder={placeholder}
          />,
        ]}
      />
    </div>
  );
}

/** 取消执行：须填写理由再提交 */
const CancelExecutionModal: React.FC<CancelExecutionModalProps> = ({
  open,
  hasTarget = true,
  confirmLoading,
  onCancel,
  onSubmit,
  title = '取消执行',
  okText = '确认取消',
  hint,
  placeholder,
  className,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const visible = open && hasTarget;

  const handleSubmit = async (formData: Record<string, unknown>) => {
    const reason = String(formData.cancelReason ?? '').trim();
    if (!reason) {
      throw new Error('missing cancelReason');
    }
    setSubmitting(true);
    try {
      await onSubmit(reason);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormModal
      className={classNames('cancel-execution-modal', styles['cancel-execution-modal'], className)}
      title={title}
      open={visible}
      onCancel={onCancel}
      autoClose
      okText={okText}
      okButtonProps={{ danger: true, loading: confirmLoading || submitting }}
      destroyOnHidden
      formProps={{
        data: { cancelReason: '' },
        onSubmit: handleSubmit,
      }}
    >
      <CancelExecutionForm hint={hint} placeholder={placeholder} />
    </FormModal>
  );
};

export default CancelExecutionModal;
