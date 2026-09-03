import { FlexBoxFetch } from '@/components';
import { Button, Card, Flex, Space, Tag, Typography } from 'antd';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import styles from './style.module.scss';

const { Text, Title, Paragraph } = Typography;

const statusList = [
  { color: 'default', text: '未开始' },
  { color: 'processing', text: '进行中' },
  { color: 'success', text: '已完成' },
  { color: 'error', text: '待复核' },
];

type InviteItem = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  status: (typeof statusList)[number];
  invitedAt: string;
  remark?: string;
};

const mockPage = ({ pageSize, keyword }: { pageSize: number; keyword?: string }): InviteItem[] =>
  Array.from({ length: pageSize }).map((_, index) => {
    const status = statusList[index % statusList.length]!;
    const seq = index + 1;
    return {
      id: `invite-${seq}`,
      code: `EC${String(8900 + seq).padStart(4, '0')}`,
      name: `候选人 ${seq}`,
      email: `user${seq}@leapin.io`,
      phone: `+86 1380000${String(seq).padStart(4, '0')}`,
      status,
      invitedAt: `2026-06-${String((seq % 28) + 1).padStart(2, '0')} 10:00`,
      remark:
        index % 3 === 1
          ? `${keyword || '面试'}进展说明：当前题目较多，卡片会被拉高，同一行其它卡片应对齐。`
          : '',
    };
  });

const InviteCard = ({ item }: { item: InviteItem }) => (
  <Card
    size="small"
    title={item.code}
    extra={<Tag color={item.status.color}>{item.status.text}</Tag>}
  >
    <Flex vertical gap={8}>
      <Text strong>{item.name}</Text>
      <Text type="secondary">{item.email}</Text>
      <Text type="secondary">{item.phone}</Text>
      <Text type="secondary">邀请时间 {item.invitedAt}</Text>
      {item.remark ? (
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {item.remark}
        </Paragraph>
      ) : null}
    </Flex>
  </Card>
);

/**
 * 对齐上游「FlexBoxFetch 远程列表」：loader 本地 mock；分页；换列用新 size 重请求
 */
const FlexBoxFetchDemo: React.FC = () => {
  const fetchRef = useRef<unknown>(null);
  const [position, setPosition] = useState<'top' | 'bottom' | 'both'>('both');

  return (
    <div className={classNames('flex-box-fetch-demo', styles['flex-box-fetch-demo'])}>
      <Flex vertical gap={32}>
        <div>
          <Title level={5}>getFetchApi + 底部分页</Title>
          <Space style={{ marginBottom: 8 }}>
            <Text type="secondary">column.size 作为 pageSize；缩小容器会换列并重新请求</Text>
            <Button
              onClick={() => {
                // eslint-disable-next-line no-console
                console.log(fetchRef.current);
              }}
            >
              打印 Fetch 实例
            </Button>
          </Space>
          <FlexBoxFetch
            ref={fetchRef}
            rowKey="id"
            gutter={12}
            columns={[
              { width: 480, col: 1, size: 8 },
              { width: 800, col: 2, size: 10 },
              { width: 1100, col: 3, size: 12 },
              { width: 1600, col: 4, size: 12 },
            ]}
            pagination={{ position: 'bottom', align: 'center' }}
            getFetchApi={({ size }) => ({
              data: { pageSize: size, keyword: '面试' },
              loader: ({ data }: { data: { pageSize: number; keyword?: string } }) =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve({ pageData: mockPage(data) });
                  }, 400);
                }),
            })}
            renderItem={(item) => (
              <FlexBoxFetch.Item>
                <InviteCard item={item} />
              </FlexBoxFetch.Item>
            )}
          />
        </div>
        <div>
          <Title level={5}>dataFormat + 分页位置</Title>
          <Space wrap style={{ marginBottom: 8 }}>
            {(['top', 'bottom', 'both'] as const).map((p) => (
              <Button
                key={p}
                type={position === p ? 'primary' : 'default'}
                onClick={() => setPosition(p)}
              >
                {p}
              </Button>
            ))}
          </Space>
          <FlexBoxFetch
            rowKey="id"
            gutter={12}
            columns={[
              { width: 480, col: 1, size: 6 },
              { width: 900, col: 2, size: 8 },
              { width: 1400, col: 3, size: 9 },
            ]}
            pagination={{ position, align: 'end', defaultPageSize: 6 }}
            dataFormat={(data: { list?: InviteItem[] }) => data.list || []}
            getFetchApi={({ size }) => ({
              data: { pageSize: size },
              loader: ({ data }: { data: { pageSize: number } }) =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve({ list: mockPage({ pageSize: data.pageSize, keyword: '分页' }) });
                  }, 300);
                }),
            })}
            renderItem={(item) => (
              <FlexBoxFetch.Item>
                <InviteCard item={item} />
              </FlexBoxFetch.Item>
            )}
          />
        </div>
      </Flex>
    </div>
  );
};

export default FlexBoxFetchDemo;
