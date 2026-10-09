import { formatFileSize } from '@/utils/format';
import { CloudDownload } from '@/components/Icons';
import SemanticTag from '@/components/Tag/SemanticTag';
import { Button, message } from 'antd';
import React from 'react';
import { getFileIcon, getFileTypeName, normalizeFileDisplayItem } from '../fileDisplay';
import { getFileTypeTagColor, getPreviewKind } from '../previewKind';
import type { FileDisplayItem } from '../types';
import { fetchWithMarsunAuth, useFileAuthHeaders } from '../utils/authedFetch';
import FilePreviewContent from './FilePreviewContent';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface FilePreviewProps {
  file: FileDisplayItem;
  url?: string;
  downloadUrl?: string;
  onDownload?: (file: FileDisplayItem) => void;
  unsupportedMessage?: string;
  title?: React.ReactNode;
  extra?: React.ReactNode;
}

function resolvePreviewUrl(file: FileDisplayItem, url?: string): string | undefined {
  return url ?? file.url ?? file.thumbnailUrl;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  url,
  downloadUrl,
  onDownload,
  unsupportedMessage = '暂不支持预览此文件类型',
  title,
  extra,
}) => {
  const resolvedFile = normalizeFileDisplayItem(file);
  const previewUrl = resolvePreviewUrl(resolvedFile, url);
  const resolvedDownloadUrl = downloadUrl ?? previewUrl;
  const canDownload = Boolean(onDownload || resolvedDownloadUrl);
  const previewKind = getPreviewKind(resolvedFile);
  const typeLabel = getFileTypeName(resolvedFile.name, resolvedFile.mimeType);
  const authHeaders = useFileAuthHeaders();

  const handleDownload = () => {
    if (onDownload) {
      onDownload(resolvedFile);
      return;
    }
    if (!resolvedDownloadUrl) return;
    void (async () => {
      try {
        const res = await fetchWithMarsunAuth(resolvedDownloadUrl, authHeaders);
        if (!res.ok) throw new Error(`下载失败 (${res.status})`);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = resolvedFile.name || 'download';
        a.click();
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        message.error(err instanceof Error ? err.message : '下载失败');
      }
    })();
  };

  return (
    <div className={classNames('file-preview', styles['file-preview'])}>
      <div className={classNames('file-preview-header', styles['file-preview-header'])}>
        {title ?? (
          <>
            <div className={styles['file-preview-info']}>
              <span className={styles['file-preview-icon']}>
                {getFileIcon(resolvedFile.name, resolvedFile.mimeType)}
              </span>
              <span className={styles['file-preview-name']} title={resolvedFile.name}>
                {resolvedFile.name}
              </span>
              <SemanticTag color={getFileTypeTagColor(previewKind)}>{typeLabel}</SemanticTag>
              {resolvedFile.size != null && (
                <span className={styles['file-preview-size']}>
                  {formatFileSize(resolvedFile.size)}
                </span>
              )}
            </div>
            {canDownload && (
              <Button type="link" icon={<CloudDownload />} onClick={handleDownload}>
                下载
              </Button>
            )}
          </>
        )}
        {extra}
      </div>
      <div className={classNames('file-preview-body', styles['file-preview-body'])}>
        <FilePreviewContent
          file={resolvedFile}
          previewUrl={previewUrl}
          unsupportedMessage={unsupportedMessage}
        />
      </div>
    </div>
  );
};

export default FilePreview;
