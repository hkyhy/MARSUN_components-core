import { FlexBox, SemanticTag, SEMANTIC_COLORS } from '@/components';
import { Button, Card, Flex, Space, Typography } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import { candidates, statusMap, type CandidateItem } from '../mockCandidates';
import styles from './style.module.scss';

const { Text, Title, Paragraph } = Typography;

const CandidateCard = ({ item }: { item: CandidateItem }) => {
  const resolvedStatus = statusMap[item.status];
  const color = resolvedStatus?.color ?? SEMANTIC_COLORS.DEFAULT;
  const text = resolvedStatus?.text ?? '未开始';
  return (
    <Card size="small" title={item.code} extra={<SemanticTag color={color}>{text}</SemanticTag>}>
      <Flex vertical gap={8}>
        <Text strong>{item.name}</Text>
        <Text type="secondary">{item.email}</Text>
        <Text type="secondary">{item.phone}</Text>
        <Text type="secondary">邀请时间 {item.invitedAt}</Text>
        {item.score != null ? <Text>综合分 {item.score}</Text> : null}
        {item.remark ? (
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {item.remark}
          </Paragraph>
        ) : null}
      </Flex>
    </Card>
  );
};

/**
 * 对齐上游「FlexBox 响应式卡片栅格」：基础列表 + 自定义断点/onChange + gutter
 */
const FlexBoxResponsiveDemo: React.FC = () => {
  const [column, setColumn] = useState<{ col: number; size?: number; width: number } | null>(null);
  const [gutter, setGutter] = useState(8);

  return (
    <div className={classNames('flex-box-responsive-demo', styles['flex-box-responsive-demo'])}>
      <Flex vertical gap={32}>
        <div>
          <Title level={5}>基础用法</Title>
          <Paragraph type="secondary">
            默认断点：容器 ≤576 一列，≤768 两列，≤1200
            四列，更宽五列。长短内容混排时同一行卡片拉齐高度。
          </Paragraph>
          <FlexBox
            dataSource={candidates}
            rowKey="id"
            gutter={12}
            renderItem={(item) => (
              <FlexBox.Item>
                <CandidateCard item={item} />
              </FlexBox.Item>
            )}
          />
        </div>
        <div>
          <Title level={5}>自定义 columns / onChange</Title>
          <Space wrap style={{ marginBottom: 8 }}>
            <Text type="secondary">首次量宽不回调</Text>
            {column ? (
              <SemanticTag color={SEMANTIC_COLORS.INFO}>
                col={column.col} / size={column.size} / width≤{column.width}
              </SemanticTag>
            ) : (
              <SemanticTag color={SEMANTIC_COLORS.DEFAULT}>等待容器量宽</SemanticTag>
            )}
          </Space>
          <FlexBox
            columns={[
              { width: 480, col: 1, size: 8 },
              { width: 800, col: 2, size: 10 },
              { width: 1200, col: 3, size: 12 },
            ]}
            gutter={[16, 16]}
            dataSource={candidates}
            rowKey={(item) => item.id}
            onChange={setColumn}
            renderItem={(item) => (
              <FlexBox.Item>
                <CandidateCard item={item} />
              </FlexBox.Item>
            )}
          />
        </div>
        <div>
          <Title level={5}>gutter</Title>
          <Space style={{ marginBottom: 8 }}>
            <Text type="secondary">间距</Text>
            {[8, 16, 24].map((g) => (
              <Button
                key={g}
                type={gutter === g ? 'primary' : 'default'}
                onClick={() => setGutter(g)}
              >
                {g}
              </Button>
            ))}
          </Space>
          <FlexBox
            dataSource={candidates.slice(0, 4)}
            rowKey="id"
            gutter={gutter}
            renderItem={(item) => (
              <FlexBox.Item>
                <CandidateCard item={item} />
              </FlexBox.Item>
            )}
          />
        </div>
      </Flex>
    </div>
  );
};

export default FlexBoxResponsiveDemo;
