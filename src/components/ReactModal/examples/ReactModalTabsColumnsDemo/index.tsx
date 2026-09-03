import {
  ColumnsLayout,
  DrawerContextHolder,
  ReactDrawer,
  ReactModal,
  ScrollRegion,
  TabsLayout,
} from '@/components';
import { App, Avatar, Button, Progress, Radio, Space, Tag, Typography, message } from 'antd';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import styles from './style.module.scss';

const { Text, Title, Paragraph } = Typography;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待评估', color: 'orange' },
  passed: { label: '已通过', color: 'success' },
  hold: { label: '待定', color: 'processing' },
};

const CANDIDATES = [
  {
    key: '1',
    name: '陈思远',
    role: '高级前端工程师',
    years: 6,
    status: 'pending',
    scores: { comm: 4, tech: 5, project: 4, collab: 4 },
    summary: '主导过设计系统与性能治理，对 React 生态和工程化有较深实践。',
    notes: [
      { title: '技术深度', body: '能清晰描述虚拟列表在项目中的落地方式。' },
      { title: '协作推进', body: '推动组件库在多条业务线统一接入。' },
    ],
  },
  {
    key: '2',
    name: '李雨桐',
    role: '前端工程师',
    years: 4,
    status: 'passed',
    scores: { comm: 5, tech: 4, project: 4, collab: 5 },
    summary: '表达结构清晰，B 端复杂表单与权限场景经验丰富。',
    notes: [{ title: '综合评价', body: '建议通过，可安排 HR 谈薪。' }],
  },
  {
    key: '3',
    name: '周亦凡',
    role: '资深前端',
    years: 8,
    status: 'hold',
    scores: { comm: 3, tech: 5, project: 5, collab: 3 },
    summary: '技术栈匹配度高，但管理岗预期与当前编制不完全一致。',
    notes: [{ title: '风险', body: '期望职级偏高，需对齐编制。' }],
  },
];

/**
 * 批量候选人评估：TabsLayout + ColumnsLayout
 */
const ReactModalTabsColumnsDemoInner: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'modal' | 'drawer'>('modal');
  const [activeKey, setActiveKey] = useState('1');
  const isDrawer = mode === 'drawer';

  useEffect(() => {
    setOpen(false);
  }, [mode]);

  const active = useMemo(() => {
    return CANDIDATES.find((c) => c.key === activeKey) ?? CANDIDATES[0]!;
  }, [activeKey]);
  const statusMeta = STATUS_MAP[active.status] ?? STATUS_MAP.pending!;
  const Overlay = isDrawer ? ReactDrawer : ReactModal;
  const avgScore =
    (active.scores.comm + active.scores.tech + active.scores.project + active.scores.collab) / 4;

  const listPane = (
    <ScrollRegion>
      <div className={styles.list}>
        {CANDIDATES.map((c) => {
          const st = STATUS_MAP[c.status] ?? STATUS_MAP.pending!;
          return (
            <div
              key={c.key}
              className={classNames(styles.listItem, { [styles.isActive!]: c.key === activeKey })}
              onClick={() => setActiveKey(c.key)}
            >
              <div className={styles.listMain}>
                <Avatar style={{ backgroundColor: '#1677ff' }}>{c.name[0]}</Avatar>
                <div className={styles.listBody}>
                  <div className={styles.listTitle}>{c.name}</div>
                  <div className={styles.listMeta}>
                    {c.role} · {c.years} 年
                  </div>
                </div>
                <Tag color={st.color}>{st.label}</Tag>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollRegion>
  );

  const detailPane = (
    <ScrollRegion inset>
      <div className={styles.detailHeader}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {active.name}
          </Title>
          <Space size={8} style={{ marginTop: 8 }}>
            <Tag>{active.role}</Tag>
            <Tag color={statusMeta.color}>{statusMeta.label}</Tag>
          </Space>
        </div>
        <div>
          <Text type="secondary">综合</Text>
          <div className={styles.avg}>{avgScore.toFixed(1)}</div>
        </div>
      </div>
      <Paragraph>{active.summary}</Paragraph>
      <div className={styles.scoreGrid}>
        {(
          [
            ['沟通', active.scores.comm],
            ['技术', active.scores.tech],
            ['项目', active.scores.project],
            ['协作', active.scores.collab],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <div className={styles.scoreLabel}>
              <span>{label}</span>
              <span>{value}/5</span>
            </div>
            <Progress percent={(value / 5) * 100} showInfo={false} size="small" />
          </div>
        ))}
      </div>
      {active.notes.map((n) => (
        <div key={n.title} className={styles.note}>
          <div className={styles.noteTitle}>{n.title}</div>
          <div>{n.body}</div>
        </div>
      ))}
    </ScrollRegion>
  );

  return (
    <div
      className={classNames(
        'react-modal-tabs-columns-demo',
        styles['react-modal-tabs-columns-demo'],
      )}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space align="center" wrap>
          <Text type="secondary">打开方式</Text>
          <Radio.Group
            value={mode}
            optionType="button"
            size="small"
            options={[
              { label: 'Modal', value: 'modal' },
              { label: 'Drawer', value: 'drawer' },
            ]}
            onChange={(e) => setMode(e.target.value)}
          />
        </Space>
        <Button type="primary" onClick={() => setOpen(true)}>
          打开批量评估
        </Button>
        <Overlay
          title="批量候选人评估"
          open={open}
          size="large"
          noPadding
          onClose={() => setOpen(false)}
          onConfirm={() => {
            message.success('评估已保存');
            setOpen(false);
          }}
          confirmText="保存本批"
        >
          <TabsLayout
            items={[
              {
                key: 'evaluate',
                label: '逐人评估',
                children: (
                  <ColumnsLayout widths={[280, '1fr']}>
                    {listPane}
                    {detailPane}
                  </ColumnsLayout>
                ),
              },
              {
                key: 'overview',
                label: '批次概览',
                children: (
                  <ScrollRegion inset>
                    <div className={styles.overview}>
                      {CANDIDATES.map((c) => (
                        <div key={c.key} className={styles.statCard}>
                          <div className={styles.statValue}>{c.name}</div>
                          <div className={styles.statLabel}>
                            {(STATUS_MAP[c.status] ?? STATUS_MAP.pending!).label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollRegion>
                ),
              },
            ]}
          />
        </Overlay>
      </Space>
    </div>
  );
};

const ReactModalTabsColumnsDemo: React.FC = () => (
  <App>
    <DrawerContextHolder />
    <ReactModalTabsColumnsDemoInner />
  </App>
);

export default ReactModalTabsColumnsDemo;
