import { Code } from '@/components/Icons';
import { Empty, Masonry, Table, Typography } from 'antd';
import type { MasonryItemType } from 'antd/es/masonry/MasonryItem';
import { Highlight, themes } from 'prism-react-renderer';
import React, { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { ApiDocRow, ComponentExample } from '../examples';
import { EXAMPLE_REGISTRY } from '../examples-registry';
import styles from './style.module.scss';

const { Title, Paragraph, Text } = Typography;

type ExampleSegment =
  | { type: 'masonry'; examples: ComponentExample[] }
  | { type: 'block'; examples: ComponentExample[] };

function segmentExamples(examples: ComponentExample[]): ExampleSegment[] {
  const segments: ExampleSegment[] = [];

  for (const example of examples) {
    if (example.block) {
      segments.push({ type: 'block', examples: [example] });
      continue;
    }

    const last = segments[segments.length - 1];
    if (last?.type === 'masonry') {
      last.examples.push(example);
    } else {
      segments.push({ type: 'masonry', examples: [example] });
    }
  }

  return segments;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
  <div className={styles['example-page-root']}>
    <div className={styles['example-page-container']}>
      <span className={styles['example-page-wrapper']}>TSX</span>
      <Text copyable={{ text: code, tooltips: ['复制代码', '已复制'] }} />
    </div>
    <div className={styles['example-page-header']}>
      <Highlight theme={themes.github} code={code.trim()} language="tsx">
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={className} style={{ ...style, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            <code className={styles['example-page-body']}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line, key: i })}>
                  <span className={styles['example-page-footer']}>{i + 1}</span>
                  <span>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  </div>
);

const ExampleCard: React.FC<{ example: ComponentExample }> = ({ example }) => {
  const [expanded, setExpanded] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);

  const handleExpand = useCallback(async () => {
    if (!expanded && !sourceCode) {
      setLoadingCode(true);
      try {
        const mod = await example.sourcePath();
        setSourceCode(mod.default);
      } finally {
        setLoadingCode(false);
      }
    }
    setExpanded(!expanded);
  }, [expanded, sourceCode, example]);

  const Demo = example.component;

  return (
    <div className={styles['example-page-row']}>
      <div className={styles['example-page-col']} style={{ minHeight: 80 }}>
        <React.Suspense fallback={<div className={styles['example-page-wrap']}>加载中...</div>}>
          <Demo />
        </React.Suspense>
      </div>
      <div className={styles['example-page-item']}>
        <div className={styles['example-page-link']}>
          <h4 className={styles['example-page-label']}>{example.title}</h4>
          <p className={styles['example-page-value']}>{example.description}</p>
        </div>
        <button type="button" onClick={handleExpand} className={styles['example-page-meta']}>
          <Code style={{ fontSize: 13 }} />
          {expanded ? '收起代码' : '展开代码'}
        </button>
      </div>
      {expanded &&
        (loadingCode ? (
          <div className={styles['example-page-icon']}>加载源码...</div>
        ) : (
          <CodeBlock code={sourceCode} />
        ))}
    </div>
  );
};

const ExampleMasonry: React.FC<{ examples: ComponentExample[] }> = ({ examples }) => {
  const items = useMemo<MasonryItemType<ComponentExample>[]>(
    () =>
      examples.map((example, index) => ({
        key: `${example.title}-${index}`,
        data: example,
        children: <ExampleCard example={example} />,
      })),
    [examples],
  );

  return (
    <Masonry
      columns={2}
      gutter={[20, 28]}
      fresh
      className={styles['example-page-masonry']}
      items={items}
    />
  );
};

const ExampleSegments: React.FC<{ examples: ComponentExample[] }> = ({ examples }) => {
  const segments = useMemo(() => segmentExamples(examples), [examples]);

  return (
    <>
      {segments.map((segment, segmentIndex) => {
        if (segment.type === 'block') {
          return (
            <div key={`block-${segmentIndex}`} className={styles['example-page-block-segment']}>
              {segment.examples.map((example, index) => (
                <ExampleCard key={`${example.title}-${index}`} example={example} />
              ))}
            </div>
          );
        }

        return <ExampleMasonry key={`masonry-${segmentIndex}`} examples={segment.examples} />;
      })}
    </>
  );
};

const API_COLUMNS = [
  {
    title: '属性',
    dataIndex: 'prop',
    key: 'prop',
    width: 180,
    render: (t: string) => <code className={styles['example-page-desc']}>{t}</code>,
  },
  { title: '说明', dataIndex: 'desc', key: 'desc' },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 220,
    render: (t: string) => <code className={styles['example-page-actions']}>{t}</code>,
  },
  {
    title: '默认值',
    dataIndex: 'defaultVal',
    key: 'defaultVal',
    width: 120,
    render: (v: string | undefined) => (v !== undefined ? <code>{v}</code> : '-'),
  },
];

const ExamplePage: React.FC = () => {
  const location = useLocation();
  const group = EXAMPLE_REGISTRY[location.pathname];

  if (!group) {
    return (
      <div className={styles['example-page-group']}>
        <Empty description="暂无示例" />
      </div>
    );
  }

  const useMasonry = group.examples.length > 1;

  return (
    <div className={styles['example-page-cell']}>
      <div className={styles['example-page-aside']}>
        <h2 className={styles['example-page-main']}>{group.title}</h2>
        {group.description && (
          <Paragraph type="secondary" className={styles['example-page-section']}>
            {group.description}
          </Paragraph>
        )}
      </div>

      <div className={styles['example-page-examples']}>
        {useMasonry ? (
          <ExampleSegments examples={group.examples} />
        ) : (
          group.examples.map((example, idx) => (
            <ExampleCard key={idx} example={example} />
          ))
        )}
      </div>

      {group.apiDoc && (
        <section className={styles['example-page-loading']}>
          <Title level={4}>API</Title>
          {group.apiDoc.map((doc) => (
            <div key={doc.componentName} className={styles['example-page-list']}>
              <h4 className={styles['example-page-empty']}>{doc.componentName}</h4>
              <Table<ApiDocRow>
                dataSource={doc.rows.map((r) => ({ ...r, key: r.prop }))}
                columns={API_COLUMNS}
                pagination={false}
                size="small"
                bordered
                rowKey="prop"
              />
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ExamplePage;
