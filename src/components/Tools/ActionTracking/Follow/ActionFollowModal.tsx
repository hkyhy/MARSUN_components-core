import { useState, type ReactNode } from 'react';
import { Form, SubmitButton } from '../../../FormInfo';
import { Button, Modal } from 'antd';
import classNames from 'classnames';
import { VirtualScrollbar } from '../../../VirtualScrollbar';
import styles from './ActionFollowModal.module.scss';

export type ActionFollowView = 'follow' | 'review' | 'cancelled';

export type ActionFollowModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  loading?: boolean;
  saving?: boolean;
  view: ActionFollowView;
  /** 摘要区（App 注入 ActionFollowSummary 等） */
  summarySlot: ReactNode;
  /** 告警处置等扩展（可选） */
  dispositionSlot?: ReactNode;
  /** 表单字段区（跟进/复核）；cancelled 忽略 */
  formSlot?: ReactNode;
  formData?: Record<string, unknown>;
  formKey?: string;
  onSubmit?: (values: Record<string, unknown>, mode: 'follow' | 'complete') => Promise<void>;
  width?: number;
  className?: string;
};

/**
 * 行动跟进弹层壳：布局 + 页脚；业务摘要/表单/API 由 App 注入。
 * 可控 HTML 展示须经 sanitizeActionHtml（F3）。
 */
const ActionFollowModal: React.FC<ActionFollowModalProps> = ({
  open,
  title,
  onClose,
  loading,
  saving,
  view,
  summarySlot,
  dispositionSlot,
  formSlot,
  formData = {},
  formKey = 'follow',
  onSubmit,
  width = 720,
  className,
}) => {
  const [submitMode, setSubmitMode] = useState<'follow' | 'complete'>('follow');
  const busy = Boolean(saving || loading);
  const isCancelled = view === 'cancelled';
  const isReview = view === 'review';

  const scrollBody = (
    <VirtualScrollbar
      className={classNames('actions-follow-modal-scroll', styles['actions-follow-modal-scroll'])}
      wrapperClassName={styles['actions-follow-modal-scroll-wrap']}
    >
      <div className={classNames('actions-follow-modal-body', styles['actions-follow-modal-body'])}>
        {summarySlot}
        {dispositionSlot}
        {!isCancelled ? formSlot : null}
      </div>
    </VirtualScrollbar>
  );

  const footer = (
    <div
      className={classNames('actions-follow-modal-footer', styles['actions-follow-modal-footer'])}
    >
      {isCancelled ? (
        <Button type="primary" onClick={onClose}>
          关闭
        </Button>
      ) : (
        <>
          <Button onClick={onClose} disabled={busy}>
            取消
          </Button>
          {isReview ? (
            <SubmitButton
              type="primary"
              loading={busy}
              onMouseDown={() => setSubmitMode('complete')}
            >
              保存备注
            </SubmitButton>
          ) : (
            <>
              <SubmitButton
                type="default"
                loading={busy}
                onMouseDown={() => setSubmitMode('follow')}
              >
                跟进
              </SubmitButton>
              <SubmitButton
                type="primary"
                loading={busy}
                onMouseDown={() => setSubmitMode('complete')}
              >
                提交并完成
              </SubmitButton>
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <Modal
      className={classNames('actions-follow-modal', styles['actions-follow-modal'], className)}
      title={title}
      open={open}
      onCancel={onClose}
      width={width}
      centered
      destroyOnHidden
      footer={null}
    >
      {isCancelled ? (
        <>
          {scrollBody}
          {footer}
        </>
      ) : (
        <Form
          key={formKey}
          data={formData}
          onSubmit={async (values: Record<string, unknown>) => {
            await onSubmit?.(values, submitMode);
          }}
        >
          {scrollBody}
          {footer}
        </Form>
      )}
    </Modal>
  );
};

export default ActionFollowModal;
