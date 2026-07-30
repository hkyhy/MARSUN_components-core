import { Modal } from '@/components';
import { Button } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './style.module.scss';

/**
 * 通用 Modal：S/M/L、标题 info/description/Action、固定高滚动
 */
const ModalBasicDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState<'S' | 'M' | 'L'>('L');

  return (
    <div className={classNames('marsun-modal-basic-demo', styles['marsun-modal-basic-demo'])}>
      <div className={styles['marsun-modal-basic-demo-toolbar']}>
        {(['S', 'M', 'L'] as const).map((s) => (
          <Button key={s} type={size === s ? 'primary' : 'default'} onClick={() => setSize(s)}>
            {s}
          </Button>
        ))}
        <Button type="primary" onClick={() => setOpen(true)}>
          打开 Modal
        </Button>
      </div>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        size={size}
        title={`示例报告弹窗（${size}）`}
        info={[
          { label: '报告 ID', value: 'RCA-DEMO-001' },
          { label: '生成时间', value: '2026-07-30 09:00' },
        ]}
        description="标题旁 Info 展示结构化详情；下方 description 为次要说明。"
        actions={[
          { children: '历史报告', type: 'primary', onClick: () => undefined },
          { children: '预览导出', onClick: () => undefined },
        ]}
        footer={
          <Button type="primary" onClick={() => setOpen(false)}>
            关闭
          </Button>
        }
        scrollable
      >
        <p>固定高度 body，内容仅纵向滚动，不应出现横向滚动条。</p>
        {Array.from({ length: 24 }).map((_, i) => (
          <p key={i}>段落内容 {i + 1} — 用于验证 VirtualScrollbar 与宽度约束。</p>
        ))}
      </Modal>
    </div>
  );
};

export default ModalBasicDemo;
