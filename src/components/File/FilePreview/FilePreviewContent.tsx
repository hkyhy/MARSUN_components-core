import { Empty, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { getPreviewKind, needsBlobPreview } from '../previewKind';
import type { FileDisplayItem } from '../types';
import {
  fetchAuthedArrayBuffer,
  fetchAuthedObjectUrl,
  useFileAuthHeaderKey,
  useFileAuthHeaders,
} from '../utils/authedFetch';
import styles from './style.module.scss';
import classNames from 'classnames';

interface FilePreviewContentProps {
  file: FileDisplayItem;
  previewUrl?: string;
  unsupportedMessage?: string;
}

/** 受护 URL → objectURL（img/iframe/video）；公开 URL 原样返回 */
function useAuthedObjectUrl(previewUrl?: string): {
  src: string | undefined;
  loading: boolean;
  error: string | null;
} {
  const headers = useFileAuthHeaders();
  const authKey = useFileAuthHeaderKey();
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!previewUrl) {
      setSrc(undefined);
      setError(null);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    let revoke: (() => void) | undefined;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const got = await fetchAuthedObjectUrl(previewUrl, headers);
        if (cancelled) {
          got.revoke();
          return;
        }
        revoke = got.revoke;
        setSrc(got.objectUrl);
      } catch (err) {
        if (!cancelled) {
          setSrc(undefined);
          setError(err instanceof Error ? err.message : '预览加载失败');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      revoke?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- headers 随 authKey 变
  }, [previewUrl, authKey]);

  return { src, loading, error };
}

function mapPreviewError(err: unknown, kind: string): string {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  if (kind === 'excel' && /anchors/i.test(raw)) {
    return '该 Excel 含图表/绘图等对象，当前预览引擎无法解析，请下载后用本地软件打开';
  }
  if (kind === 'word' && /ole|compound|docfile|not a valid/i.test(raw)) {
    return '旧版 Word（.doc）暂无法排版预览，请下载后用 Word 打开';
  }
  if (raw && !/^Cannot read properties/i.test(raw) && !/^undefined/i.test(raw)) {
    return raw;
  }
  return kind === 'excel'
    ? 'Excel 预览失败，请下载后查看'
    : kind === 'word'
      ? 'Word 预览失败，请下载后查看'
      : '预览加载失败';
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

function isZipBuffer(data: ArrayBuffer): boolean {
  const u = new Uint8Array(data);
  return u.length >= 2 && u[0] === 0x50 && u[1] === 0x4b; // PK
}

function isOleBuffer(data: ArrayBuffer): boolean {
  const u = new Uint8Array(data);
  return u.length >= 4 && u[0] === 0xd0 && u[1] === 0xcf && u[2] === 0x11 && u[3] === 0xe0;
}

/** 服务端把旧版 .doc 转成 HTML 后，预览响应不再是 OLE */
function isLikelyHtmlBuffer(data: ArrayBuffer): boolean {
  const u = new Uint8Array(data.byteLength > 64 ? data.slice(0, 64) : data);
  let offset = 0;
  if (u.length >= 3 && u[0] === 0xef && u[1] === 0xbb && u[2] === 0xbf) offset = 3;
  const head = new TextDecoder('utf-8').decode(u.subarray(offset)).trimStart().toLowerCase();
  return (
    head.startsWith('<!doctype') ||
    head.startsWith('<html') ||
    head.startsWith('<pre') ||
    head.startsWith('<div') ||
    head.startsWith('<article')
  );
}

async function renderWord(container: HTMLElement, data: ArrayBuffer) {
  // 误命名为 .doc 的真实 docx（ZIP）仍走 docx-preview
  if (isZipBuffer(data)) {
    const { renderAsync } = await import('docx-preview');
    const blob = new Blob([data]);
    await renderAsync(blob, container, container, {
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      breakPages: true,
    });
    return;
  }

  // Assets 等对旧版 .doc 预览返回的 HTML
  if (isLikelyHtmlBuffer(data)) {
    container.innerHTML = new TextDecoder('utf-8').decode(data);
    return;
  }

  if (isOleBuffer(data)) {
    throw new Error('旧版 Word（.doc）暂无法排版预览，请下载后用 Word 打开');
  }

  throw new Error('无法识别的 Word 文件格式，请下载后查看');
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
  const authHeaders = useFileAuthHeaders();
  const authKey = useFileAuthHeaderKey();
  const media = useAuthedObjectUrl(
    kind === 'image' || kind === 'pdf' || kind === 'iframe' || kind === 'video' || kind === 'audio'
      ? previewUrl
      : undefined,
  );

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
        const data = await fetchAuthedArrayBuffer(previewUrl, authHeaders);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- authHeaders 随 authKey
  }, [previewUrl, kind, file.id, file.name, authKey]);

  if (!previewUrl) {
    return <Empty description="无可预览地址" />;
  }

  if (kind === 'image') {
    if (media.loading) {
      return (
        <div className={styles['file-preview-media-wrap']}>
          <Spin />
        </div>
      );
    }
    if (media.error || !media.src) {
      return <Empty description={media.error || '预览加载失败'} />;
    }
    return (
      <div className={styles['file-preview-media-wrap']}>
        <img src={media.src} alt={file.name} className={styles['file-preview-image']} />
      </div>
    );
  }

  if (kind === 'pdf' || kind === 'iframe') {
    if (media.loading) {
      return (
        <div className={styles['file-preview-media-wrap']}>
          <Spin />
        </div>
      );
    }
    if (media.error || !media.src) {
      return <Empty description={media.error || '预览加载失败'} />;
    }
    return <iframe src={media.src} title={file.name} className={styles['file-preview-iframe']} />;
  }

  if (kind === 'video') {
    if (media.loading) {
      return (
        <div className={styles['file-preview-media-wrap']}>
          <Spin />
        </div>
      );
    }
    if (media.error || !media.src) {
      return <Empty description={media.error || '预览加载失败'} />;
    }
    return (
      <div className={styles['file-preview-media-wrap']}>
        <video src={media.src} controls className={styles['file-preview-video']} />
      </div>
    );
  }

  if (kind === 'audio') {
    if (media.loading) {
      return (
        <div className={styles['file-preview-audio-wrap']}>
          <Spin />
        </div>
      );
    }
    if (media.error || !media.src) {
      return <Empty description={media.error || '预览加载失败'} />;
    }
    return (
      <div className={styles['file-preview-audio-wrap']}>
        <audio src={media.src} controls className={styles['file-preview-audio']} />
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
