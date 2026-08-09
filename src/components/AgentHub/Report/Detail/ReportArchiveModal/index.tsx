import { Modal } from '@/components/Modal';
import { Button, Input } from 'antd';
import classNames from 'classnames';
import styles from './style.module.scss';

export type ReportArchiveModalProps = {
  open: boolean;
  archivedBy: string;
  summary?: string;
  metaLabel?: string;
  busy?: boolean;
  title?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

/** 归档确认弹窗 — 归档人由业务传入（通常 SSO），只读 */
const ReportArchiveModal: React.FC<ReportArchiveModalProps> = ({
  open,
  archivedBy,
  summary,
  metaLabel,
  busy,
  title = '归档报告',
  onCancel,
  onConfirm,
}) => (
  <Modal
    title={title}
    open={open}
    onCancel={onCancel}
    size="S"
    footer={
      <div
        className={classNames(
          'marsun-report-archive-modal-footer',
          styles['marsun-report-archive-modal-footer'],
        )}
      >
        <Button onClick={onCancel} disabled={busy}>
          取消
        </Button>
        <Button type="primary" loading={busy} onClick={onConfirm}>
          确认归档
        </Button>
      </div>
    }
  >
    <div
      className={classNames('marsun-report-archive-modal', styles['marsun-report-archive-modal'])}
    >
      {metaLabel ? (
        <p
          className={classNames(
            'marsun-report-archive-modal-meta',
            styles['marsun-report-archive-modal-meta'],
          )}
        >
          {metaLabel}
        </p>
      ) : null}
      {summary ? (
        <p
          className={classNames(
            'marsun-report-archive-modal-summary',
            styles['marsun-report-archive-modal-summary'],
          )}
        >
          {summary}
        </p>
      ) : null}
      <label
        className={classNames(
          'marsun-report-archive-modal-label',
          styles['marsun-report-archive-modal-label'],
        )}
      >
        归档人
        <Input value={archivedBy} disabled placeholder="当前登录用户" />
      </label>
    </div>
  </Modal>
);

export default ReportArchiveModal;
