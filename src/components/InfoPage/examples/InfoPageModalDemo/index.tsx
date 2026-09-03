import { InfoPage, InfoPageContent, ReactModal, TableView } from '@/components';
import { Button, Flex } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './style.module.scss';

/**
 * Modal中展示：InfoPage 放入 ReactModal（非 Marsun Modal 业务壳）
 */
const InfoPageModalDemo: React.FC = () => {
  const [open, setOpen] = useState(false);

  const data = {
    id: '10001',
    name: '产品详情',
    category: '电子产品',
    price: 2999,
    stock: 500,
    status: '在售',
    description: '这是一款高性能的智能设备，支持多种功能和应用场景。',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-03-20 14:22:00',
  };

  return (
    <div className={classNames('info-page-modal-demo', styles['info-page-modal-demo'])}>
      <Flex vertical gap={16}>
        <p className={styles.hint}>
          本示例使用 ReactModal 承载 InfoPage（与 Marsun Modal S/M/L 业务壳并存）。
        </p>
        <Button type="primary" onClick={() => setOpen(true)}>
          打开 Modal 详情
        </Button>
        <ReactModal
          title="详情信息"
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
          confirmText="编辑"
          cancelText="关闭"
          size="large"
        >
          <InfoPage>
            <InfoPage.Part title="价格库存" bordered>
              <InfoPageContent
                list={[
                  { label: '价格', content: `¥${data.price}` },
                  { label: '库存', content: `${data.stock} 件` },
                ]}
              />
            </InfoPage.Part>
            <InfoPage.Part title="基本信息">
              <InfoPageContent
                list={[
                  { label: '编号', content: data.id },
                  { label: '名称', content: data.name },
                  { label: '分类', content: data.category },
                  { label: '状态', content: data.status },
                ]}
              />
            </InfoPage.Part>
            <InfoPage.Part title="详细描述">
              <p style={{ margin: 0, lineHeight: 1.8 }}>{data.description}</p>
            </InfoPage.Part>
            <InfoPage.Part title="操作日志">
              <TableView
                dataSource={[
                  { id: '1', action: '创建', operator: '管理员', time: data.createTime },
                  { id: '2', action: '更新', operator: '管理员', time: data.updateTime },
                ]}
                columns={[
                  { name: 'action', title: '操作' },
                  { name: 'operator', title: '操作人' },
                  { name: 'time', title: '时间' },
                ]}
              />
            </InfoPage.Part>
          </InfoPage>
        </ReactModal>
      </Flex>
    </div>
  );
};

export default InfoPageModalDemo;
