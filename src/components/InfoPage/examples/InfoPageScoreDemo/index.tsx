import { Score } from '@/components';
import { Card, Divider, Flex, Space, Tag } from 'antd';
import classNames from 'classnames';
import styles from './style.module.scss';

/**
 * 评分展示：Score 基础 / 自定义总分 / 紧凑 gap
 */
const InfoPageScoreDemo: React.FC = () => {
  return (
    <div className={classNames('info-page-score-demo', styles['info-page-score-demo'])}>
      <Flex vertical gap={16}>
        <Card title="基础评分" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Flex gap={24} align="center">
              <span>产品评分：</span>
              <Score value={5} />
            </Flex>
            <Flex gap={24} align="center">
              <span>服务质量：</span>
              <Score value={4} />
            </Flex>
            <Flex gap={24} align="center">
              <span>物流速度：</span>
              <Score value={3} />
            </Flex>
            <Flex gap={24} align="center">
              <span>性价比：</span>
              <Score value={2} />
            </Flex>
          </Space>
        </Card>

        <Divider />

        <Card title="自定义总分" size="small">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Flex gap={24} align="center" wrap>
              <span>3分制：</span>
              <Score value={0} total={3} />
              <Score value={1} total={3} />
              <Score value={2} total={3} />
              <Score value={3} total={3} />
            </Flex>
            <Flex gap={24} align="center" wrap>
              <span>5分制：</span>
              <Score value={2} total={5} />
              <Score value={3} total={5} />
              <Score value={4} total={5} />
              <Score value={5} total={5} />
            </Flex>
          </Space>
        </Card>

        <Divider />

        <Card title="紧凑模式（gap=0）" size="small">
          <Flex gap={24} align="center" wrap>
            <Score value={1} total={5} gap={0} />
            <Score value={3} total={5} gap={0} />
            <Score value={5} total={5} gap={0} />
          </Flex>
        </Card>

        <Divider />

        <Card title="业务场景" size="small">
          <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
            <span>智能手表 Pro</span>
            <Tag color="blue">新品上市</Tag>
          </Flex>
          <Flex justify="space-between" align="center">
            <span style={{ color: '#999', fontSize: 12 }}>用户评价</span>
            <Score value={4} total={5} />
          </Flex>
        </Card>
      </Flex>
    </div>
  );
};

export default InfoPageScoreDemo;
