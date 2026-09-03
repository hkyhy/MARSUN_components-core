import { useFlexBox } from '@/components';
import { Button, Card, Flex, Space, Tag, Typography } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import styles from './style.module.scss';

const { Text, Title, Paragraph } = Typography;

const columns = [
  { width: 360, col: 1, size: 6 },
  { width: 640, col: 2, size: 8 },
  { width: 960, col: 3, size: 12 },
  { width: 1280, col: 4, size: 16 },
];

/**
 * 对齐上游「useFlexBox 单独使用」：绑 DOM ref + 预设宽度切换
 */
const UseFlexBoxDemo: React.FC = () => {
  const [history, setHistory] = useState<string[]>([]);
  const { ref, column } = useFlexBox({
    columns,
    onChange: (next) => {
      setHistory((list) => [`col=${next.col}, size=${next.size}`, ...list].slice(0, 6));
    },
  });

  const [width, setWidth] = useState(720);
  const { ref: presetRef, column: presetColumn } = useFlexBox({ columns });

  return (
    <div className={classNames('use-flex-box-demo', styles['use-flex-box-demo'])}>
      <Flex vertical gap={32}>
        <div>
          <Title level={5}>绑定 ref</Title>
          <Paragraph type="secondary">
            必须绑 DOM。列配置取第一个 width ≥ 容器宽度的项。可拖动下方虚线框右下角改宽。
          </Paragraph>
          <Space wrap style={{ marginBottom: 8 }}>
            {column ? (
              <Tag color="blue">
                当前 col={column.col}，size={column.size}，width≤{column.width}
              </Tag>
            ) : (
              <Tag>尚未量到宽度</Tag>
            )}
          </Space>
          <div
            ref={ref as React.Ref<HTMLDivElement>}
            style={{
              width: '100%',
              maxWidth: 960,
              minWidth: 240,
              resize: 'horizontal',
              overflow: 'auto',
              padding: 12,
              border: '1px dashed #d9d9d9',
              borderRadius: 8,
              background: '#fafafa',
            }}
          >
            <Card size="small" title="被测量的容器">
              <Paragraph style={{ marginBottom: 8 }}>内部可用 column.col 自己做布局。</Paragraph>
              <Flex gap={8} wrap>
                {Array.from({ length: column?.col || 1 }).map((_, index) => (
                  <Card key={index} size="small" style={{ flex: '1 1 80px' }}>
                    列 {index + 1}/{column?.col || '-'}
                  </Card>
                ))}
              </Flex>
            </Card>
          </div>
          <Space wrap style={{ marginTop: 8 }}>
            <Text type="secondary">onChange 记录（不含首次量宽）</Text>
            {history.length === 0 ? (
              <Text type="secondary">尚无切换</Text>
            ) : (
              history.map((item, index) => <Tag key={`${item}-${index}`}>{item}</Tag>)
            )}
          </Space>
        </div>
        <div>
          <Title level={5}>预设宽度</Title>
          <Space wrap style={{ marginBottom: 8 }}>
            {[
              { w: 320, label: '320（1 列）' },
              { w: 500, label: '500（2 列）' },
              { w: 720, label: '720（3 列）' },
              { w: 1100, label: '1100（4 列）' },
            ].map(({ w, label }) => (
              <Button
                key={w}
                type={width === w ? 'primary' : 'default'}
                onClick={() => setWidth(w)}
              >
                {label}
              </Button>
            ))}
            {presetColumn ? <Tag color="blue">col={presetColumn.col}</Tag> : null}
          </Space>
          <div
            ref={presetRef as React.Ref<HTMLDivElement>}
            style={{
              width,
              maxWidth: '100%',
              padding: 12,
              background: '#f5f5f5',
              borderRadius: 8,
            }}
          >
            <Text>
              容器 {width}px →{' '}
              {presetColumn ? `${presetColumn.col} 列 / 每页 ${presetColumn.size} 条` : '测量中'}
            </Text>
          </div>
        </div>
      </Flex>
    </div>
  );
};

export default UseFlexBoxDemo;
