import { InfoPageDescriptions } from '@/components';
import { Space, Tag } from 'antd';
import classNames from 'classnames';
import styles from './style.module.scss';

/**
 * 描述列表：二维数组结构的详情展示
 */
const InfoPageDescriptionsDemo: React.FC = () => {
  return (
    <div
      className={classNames('info-page-descriptions-demo', styles['info-page-descriptions-demo'])}
    >
      <InfoPageDescriptions
        dataSource={[
          [
            {
              label: '订单编号',
              content: <strong style={{ color: '#1890ff' }}>ORD20240115001</strong>,
            },
            { label: '订单类型', content: <Tag color="blue">普通订单</Tag> },
          ],
          [
            { label: '下单时间', content: '2024-01-15 10:30:25' },
            { label: '支付时间', content: '2024-01-15 10:32:18' },
          ],
          [
            { label: '客户名称', content: '深圳市腾讯计算机系统有限公司' },
            { label: '客户类型', content: <Tag color="gold">VIP客户</Tag> },
          ],
          [
            { label: '收货人', content: '张三' },
            { label: '联系电话', content: '138-0013-8000' },
          ],
          [{ label: '收货地址', content: '广东省深圳市南山区科技园科技中一路腾讯大厦A座18层' }],
          [
            {
              label: '商品清单',
              content: (
                <Space direction="vertical" size={4}>
                  <div>1. 云服务器（2核4G）× 1台 - ¥3000.00</div>
                  <div>2. 云数据库 MySQL（50GB）× 1个 - ¥1200.00</div>
                  <div>3. 对象存储（500GB）× 1个 - ¥800.00</div>
                </Space>
              ),
            },
          ],
          [
            { label: '商品总额', content: <strong>¥5,000.00</strong> },
            { label: '运费', content: '¥0.00' },
          ],
          [
            { label: '优惠金额', content: <span style={{ color: '#52c41a' }}>-¥750.00</span> },
            {
              label: '实付金额',
              content: <strong style={{ color: '#f5222d', fontSize: 16 }}>¥4,250.00</strong>,
            },
          ],
          [
            { label: '订单状态', content: <Tag color="processing">处理中</Tag> },
            { label: '预计送达', content: '2024-01-17' },
          ],
        ]}
      />
    </div>
  );
};

export default InfoPageDescriptionsDemo;
