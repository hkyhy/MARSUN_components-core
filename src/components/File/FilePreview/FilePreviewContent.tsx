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

async function renderExcel(container: HTMLElement, data: ArrayBuffer) {
  const [{ default: jsPreviewExcel }] = await Promise.all([
    import('@js-preview/excel'),
    import('@js-preview/excel/lib/index.css'),
  ]);
  const instance = jsPreviewExcel.init(container);
  await instance.preview(data);
  return () => instance.destroy();
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
          setError(err instanceof Error ? err.message : '预览加载失败');
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
    return (
      <iframe
        src={previewUrl}
        title={file.name}
        className={styles['file-preview-iframe']}
      />
    );
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
      <div className={classNames(styles['file-preview-office'], styles['file-preview-office-wrap'])}>
        <Spin spinning={loading}>
          {error ? <Empty description={error} /> : <div ref={containerRef} className={styles['file-preview-office-inner']} />}
        </Spin>
      </div>
    );
  }

  return <Empty description={unsupportedMessage} />;
};

export default FilePreviewContent;
