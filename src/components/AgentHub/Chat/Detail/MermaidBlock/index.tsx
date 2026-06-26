import mermaid from 'mermaid';
import React, { useEffect, useId, useRef, useState } from 'react';
import { sanitizeMermaidChart } from '../../utils/sanitizeMermaidChart';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface MermaidBlockProps {
  chart: string;
  enabled?: boolean;
}

let mermaidInitialized = false;

function formatMermaidError(err: unknown): string {
  const message = err instanceof Error ? err.message : '';
  if (/parse error/i.test(message)) {
    return '图表语法有误，无法渲染';
  }
  return message || 'Mermaid 图表渲染失败';
}

const MermaidFallback: React.FC<{ chart: string; error?: string }> = ({ chart, error }) => (
  <div className="mermaid-block mermaid-block--fallback">
    <pre>
      <code className="language-mermaid">{chart}</code>
    </pre>
    {error ? <p className={classNames('mermaid-block-content', styles['mermaid-block-content'])}>{error}</p> : null}
  </div>
);

const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart, enabled = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId();
  const renderIdRef = useRef(`mermaid-${reactId.replace(/:/g, '')}`);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSvg(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const renderChart = async () => {
      try {
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict',
            theme: 'default',
          });
          mermaidInitialized = true;
        }

        const sanitizedChart = sanitizeMermaidChart(chart);
        const { svg: renderedSvg } = await mermaid.render(renderIdRef.current, sanitizedChart);
        if (!cancelled) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setSvg(null);
          setError(formatMermaidError(err));
        }
      }
    };

    void renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart, enabled]);

  if (!enabled) {
    return <MermaidFallback chart={chart} />;
  }

  if (error) {
    return <MermaidFallback chart={chart} error={error} />;
  }

  if (!svg) {
    return (
      <div className={classNames('mermaid-block', 'mermaid-block--loading', classNames('mermaid-block-col', styles['mermaid-block-col']))}>
        图表加载中…
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mermaid-block" dangerouslySetInnerHTML={{ __html: svg }} />
  );
};

export default MermaidBlock;
