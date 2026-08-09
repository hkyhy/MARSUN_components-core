import { Empty, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { getPreviewKind, needsBlobPreview } from '../previewKind';
import type { FileDisplayItem } from '../types';
import styles from './style.module.scss';
import classNames from 'classnames';

interface FilePreviewContentProps {
  file: FileDisplayItem;
  previewUrl?: string;
  unsupportedMessage?: string;
}

async function fetchPreviewBlob(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`预览加载失败 (${res.status})`);
  return res.arrayBuffer();
}

function mapPreviewError(err: unknown, kind: string): string {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  if (kind === 'excel' && /anchors/i.test(raw)) {
    return '该 Excel 含图表/绘图等对象，当前预览引擎无法解析，请下载后用本地软件打开';
  }
  if (raw && !/^Cannot read properties/i.test(raw) && !/^undefined/i.test(raw)) {
    return raw;
  }
  return kind === 'excel' ? 'Excel 预览失败，请下载后查看' : '预览加载失败';
}

/** exceljs/@js-preview 对部分含 drawing/chart 的 xlsx 会在 reconcile 时读 anchors 崩溃；去掉绘图部件后重试。 */
async function stripExcelDrawings(data: ArrayBuffer): Promise<ArrayBuffer | null> {
  try {
    const { default: JSZip } = await import('jszip');
    const zip = await JSZip.loadAsync(data);
    const names = Object.keys(zip.files);
    const drop = names.filter(
      (n) =>
        n.startsWith('xl/drawings/') ||
        n.startsWith('xl/charts/') ||
        n.startsWith('xl/diagrams/') ||
        /drawing[0-9]*\.xml$/i.test(n),
    );
    if (drop.length === 0) return null;
    for (const n of drop) {
      zip.remove(n);
    }
    // 清理 worksheet 中的 drawing 引用，避免指向已删部件
    await Promise.all(
      names
        .filter((n) => /^xl\/worksheets\/[^/]+\.xml$/i.test(n) && zip.file(n))
        .map(async (n) => {
          const file = zip.file(n);
          if (!file) return;
          const xml = await file.async('string');
          const cleaned = xml
            .replace(/<drawing[^>]*\/>/gi, '')
            .replace(/<drawing[^>]*>[\s\S]*?<\/drawing>/gi, '');
          if (cleaned !== xml) zip.file(n, cleaned);
        }),
    );
    return zip.generateAsync({ type: 'arraybuffer' });
  } catch {
    return null;
  }
}

async function previewExcelBuffer(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsPreviewExcel: { init: (el: HTMLElement) => any },
  container: HTMLElement,
  data: ArrayBuffer,
) {
  const instance = jsPreviewExcel.init(container);
  try {
    await instance.preview(data);
    return () => instance.destroy();
  } catch (err) {
    try {
      instance.destroy();
    } catch {
      // ignore
    }
    throw err;
  }
}

async function renderExcel(container: HTMLElement, data: ArrayBuffer) {
  const [{ default: jsPreviewExcel }] = await Promise.all([
    import('@js-preview/excel'),
    import('@js-preview/excel/lib/index.css'),
  ]);
  const height = Math.max(
    container.parentElement?.clientHeight ?? 0,
    Math.round(window.innerHeight * 0.65),
    480,
  );
  container.style.height = `${height}px`;

  try {
    return await previewExcelBuffer(jsPreviewExcel, container, data);
  } catch (firstErr) {
    const msg = firstErr instanceof Error ? firstErr.message : String(firstErr ?? '');
    if (!/anchors/i.test(msg)) {
      throw firstErr instanceof Error ? firstErr : new Error(mapPreviewError(firstErr, 'excel'));
    }
    const stripped = await stripExcelDrawings(data);
    if (!stripped) {
      throw firstErr instanceof Error ? firstErr : new Error(mapPreviewError(firstErr, 'excel'));
    }
    container.innerHTML = '';
    try {
      return await previewExcelBuffer(jsPreviewExcel, container, stripped);
    } catch (retryErr) {
      throw retryErr instanceof Error ? retryErr : new Error(mapPreviewError(retryErr, 'excel'));
    }
  }
}

async function renderWord(container: HTMLElement, data: ArrayBuffer) {
  const { renderAsync } = await import('docx-preview');
  const blob = new Blob([data]);
  await renderAsync(blob, container, container, {
    inWrapper: true,
    ignoreWidth: false,
    ignoreHeight: false,
    breakPages: true,
  });
}

async function renderPpt(container: HTMLElement, data: ArrayBuffer, width: number) {
  const { init } = await import('pptx-preview');
  const previewer = init(container, { width, height: Math.round(width * 0.5625), mode: 'list' });
  await previewer.preview(data);
  return () => previewer.destroy();
}

function renderText(container: HTMLElement, data: ArrayBuffer) {
  const decoder = new TextDecoder('utf-8');
  const pre = document.createElement('pre');
  pre.className = styles['file-preview-text'] ?? '';
  pre.textContent = decoder.decode(data);
  container.appendChild(pre);
}

const FilePreviewContent: React.FC<FilePreviewContentProps> = ({
  file,
  previewUrl,
  unsupportedMessage = '暂不支持预览此文件类型',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | void>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const kind = getPreviewKind(file);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !previewUrl) return undefined;

    let cancelled = false;
    cleanupRef.current?.();
    cleanupRef.current = undefined;
    container.innerHTML = '';
    setError(null);

    const run = async () => {
      if (kind === 'image') return;
      if (kind === 'pdf' || kind === 'iframe') return;
      if (kind === 'video' || kind === 'audio') return;
      if (kind === 'unsupported') return;

      setLoading(true);
      try {
        const data = await fetchPreviewBlob(previewUrl);
        if (cancelled) return;

        if (kind === 'excel') {
          cleanupRef.current = await renderExcel(container, data);
        } else if (kind === 'word') {
          await renderWord(container, data);
        } else if (kind === 'ppt') {
          const width = container.clientWidth || 852;
          cleanupRef.current = await renderPpt(container, data, width);
        } else if (kind === 'text') {
          renderText(container, data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(mapPreviewError(err, kind));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      container.innerHTML = '';
    };
  }, [previewUrl, kind, file.id, file.name]);

  if (!previewUrl) {
    return <Empty description="无可预览地址" />;
  }

  if (kind === 'image') {
    return (
      <div className={styles['file-preview-media-wrap']}>
        <img src={previewUrl} alt={file.name} className={styles['file-preview-image']} />
      </div>
    );
  }

  if (kind === 'pdf' || kind === 'iframe') {
    return <iframe src={previewUrl} title={file.name} className={styles['file-preview-iframe']} />;
  }

  if (kind === 'video') {
    return (
      <div className={styles['file-preview-media-wrap']}>
        <video src={previewUrl} controls className={styles['file-preview-video']} />
      </div>
    );
  }

  if (kind === 'audio') {
    return (
      <div className={styles['file-preview-audio-wrap']}>
        <audio src={previewUrl} controls className={styles['file-preview-audio']} />
      </div>
    );
  }

  if (kind === 'unsupported') {
    return <Empty description={unsupportedMessage} />;
  }

  if (needsBlobPreview(kind)) {
    return (
      <div
        className={classNames(styles['file-preview-office'], styles['file-preview-office-wrap'])}
      >
        <Spin spinning={loading} classNames={{ root: styles['file-preview-office-spin'] }}>
          {error ? (
            <Empty description={error} />
          ) : (
            <div ref={containerRef} className={styles['file-preview-office-inner']} />
          )}
        </Spin>
      </div>
    );
  }

  return <Empty description={unsupportedMessage} />;
};

export default FilePreviewContent;
