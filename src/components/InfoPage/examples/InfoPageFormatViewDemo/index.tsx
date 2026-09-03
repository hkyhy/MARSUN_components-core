import { formatView } from '@/components';
import { Badge, Flex, Space, Tag } from 'antd';
import classNames from 'classnames';
import styles from './style.module.scss';

/**
 * 格式化视图：formatView 日期 / 布尔 / 数字 / 金额
 */
const InfoPageFormatViewDemo: React.FC = () => {
  const demoData = {
    orderDate: '2024-01-15T10:30:00',
    deliveryDate: '2024-01-20',
    serviceDateRange: ['2024-01-01', '2024-12-31'] as [string, string],
    isVip: true,
    isActivated: false,
    userCount: 15678,
    totalAmount: 99999.99,
    discountRate: 0.085,
    completionRate: 85.67,
    phoneNumber: '13800138000',
  };

  const formatPhone = (val: string) =>
    val ? val.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : '-';

  return (
    <div className={classNames('info-page-format-view-demo', styles['info-page-format-view-demo'])}>
      <Flex vertical gap={16}>
        <div className={styles.panel}>
          <h4 className={styles.title}>formatView 工具函数演示</h4>
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Flex justify="space-between" align="center" wrap gap={8}>
              <strong>datetime:</strong>
              <span>
                {formatView(demoData.orderDate, 'datetime')} →{' '}
                {formatView(demoData.orderDate, 'datetime-YYYY年MM月DD日 HH:mm')}
              </span>
            </Flex>
            <Flex justify="space-between" align="center" wrap gap={8}>
              <strong>date:</strong>
              <span>
                {formatView(demoData.deliveryDate, 'date')} →{' '}
                {formatView(demoData.deliveryDate, 'date-YYYY/MM/DD')}
              </span>
            </Flex>
            <Flex justify="space-between" align="center" wrap gap={8}>
              <strong>dateRange:</strong>
              <span>{formatView(demoData.serviceDateRange, 'dateRange')}</span>
            </Flex>
            <Flex justify="space-between" align="center" wrap gap={8}>
              <strong>boolean:</strong>
              <Flex gap={8}>
                <span>VIP: {formatView(demoData.isVip, 'boolean-是/否')}</span>
                <span>已激活: {formatView(demoData.isActivated, 'boolean-是/否')}</span>
              </Flex>
            </Flex>
            <Flex justify="space-between" align="center" wrap gap={8}>
              <strong>number:</strong>
              <span>{formatView(demoData.userCount, 'number-useGrouping:true')} 用户</span>
            </Flex>
            <Flex justify="space-between" align="center" wrap gap={8}>
              <strong>money:</strong>
              <span style={{ color: '#f5222d', fontWeight: 'bold' }}>
                {formatView(demoData.totalAmount, 'money-元')}
              </span>
            </Flex>
            <Flex justify="space-between" align="center" wrap gap={8}>
              <strong>percent:</strong>
              <span>
                完成率:{' '}
                {formatView(demoData.completionRate, 'number-maximumFractionDigits:2-suffix:%')}
              </span>
            </Flex>
            <Flex justify="space-between" align="center" wrap gap={8}>
              <strong>custom:</strong>
              <span>{formatPhone(demoData.phoneNumber)}</span>
            </Flex>
          </Space>
        </div>

        <div className={styles.card}>
          <h4 className={styles.title}>应用场景：订单详情</h4>
          <Flex vertical gap={8}>
            <Flex justify="space-between">
              <span className={styles.muted}>下单时间</span>
              <span>{formatView(demoData.orderDate, 'datetime')}</span>
            </Flex>
            <Flex justify="space-between">
              <span className={styles.muted}>预计送达</span>
              <span>{formatView(demoData.deliveryDate, 'date-YYYY年MM月DD日')}</span>
            </Flex>
            <Flex justify="space-between">
              <span className={styles.muted}>客户类型</span>
              <Tag color={demoData.isVip ? 'gold' : 'default'}>
                {formatView(demoData.isVip, 'boolean-VIP/普通')}
              </Tag>
            </Flex>
            <Flex justify="space-between">
              <span className={styles.muted}>订单金额</span>
              <span style={{ color: '#f5222d', fontWeight: 'bold' }}>
                {formatView(demoData.totalAmount, 'money-元')}
              </span>
            </Flex>
            <Flex justify="space-between">
              <span className={styles.muted}>订单状态</span>
              <Badge status="processing" text="处理中" />
            </Flex>
          </Flex>
        </div>
      </Flex>
    </div>
  );
};

export default InfoPageFormatViewDemo;
