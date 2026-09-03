import { useConfirmModal } from '@/components';
import { App, Button, Space, message } from 'antd';
import classNames from 'classnames';
import styles from './style.module.scss';

/**
 * useConfirmModal 确认框：confirm / info / success / warning / error
 */
const ReactModalConfirmDemoInner: React.FC = () => {
  const confirmModal = useConfirmModal();

  return (
    <div className={classNames('react-modal-confirm-demo', styles['react-modal-confirm-demo'])}>
      <Space wrap>
        <Button
          danger
          onClick={() => {
            confirmModal({
              danger: true,
              type: 'confirm',
              title: '确定要删除该记录吗？',
              message: '此操作将永久删除该记录，相关数据将无法恢复。',
              onOk: () => {
                message.success('已删除');
              },
            });
          }}
        >
          confirm（危险）
        </Button>
        <Button
          onClick={() => {
            confirmModal({
              type: 'info',
              title: '提示',
              message: '评估批次将于今晚 22:00 自动归档。',
              onOk: () => undefined,
            });
          }}
        >
          info
        </Button>
        <Button
          onClick={() => {
            confirmModal({
              type: 'success',
              title: '提交成功',
              message: '评估结果已同步至招聘系统。',
              onOk: () => undefined,
            });
          }}
        >
          success
        </Button>
        <Button
          onClick={() => {
            confirmModal({
              type: 'warning',
              title: '注意',
              message: '当前候选人尚有未完成的面试反馈。',
              onOk: () => undefined,
            });
          }}
        >
          warning
        </Button>
        <Button
          onClick={() => {
            confirmModal({
              type: 'error',
              title: '同步失败',
              message: '外部系统暂时不可用，请稍后重试。',
              onOk: () => undefined,
            });
          }}
        >
          error
        </Button>
      </Space>
    </div>
  );
};

const ReactModalConfirmDemo: React.FC = () => (
  <App>
    <ReactModalConfirmDemoInner />
  </App>
);

export default ReactModalConfirmDemo;
