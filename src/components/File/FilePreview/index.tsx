import { formatFileSize } from '@/utils/format';
import { CloudDownload } from '@/components/Icons';
import { Button, Empty, Image } from 'antd';
import React from 'react';
import { getFileIcon, getFileTypeName, normalizeFileDisplayItem } from '../fileDisplay';
import type { FileDisplayItem } from '../types';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface FilePreviewProps {
  file: FileDisplayItem;
  url?: string;
  unsupportedMessage?: string;
  title?: React.ReactNode;
  extra?: React.ReactNode;
}

function resolvePreviewUrl(file: FileDisplayItem, url?: string): string | undefined {
  return url ?? file.url ?? file.thumbnailUrl;
}

function isImage(file: FileDisplayItem): boolean {
  const mime = file.mimeType ?? '';
  if (mime.startsWith('image/')) return true;
  const ext = (file.name ?? '').split('.').pop()?.toLowerCase() ?? '';
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
}

const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  url,
  unsupportedMessage = '暂不支持预览此文件类型',
  title,
  extra,
}) => {
  const resolvedFile = normalizeFileDisplayItem(file);
  const previewUrl = resolvePreviewUrl(resolvedFile, url);

  return (
    <div className={classNames('file-preview', styles['file-preview'])}>
      <div className={classNames('file-preview-header', styles['file-preview-header'])}>
        <div className={classNames('file-preview-title', styles['file-preview-title'])}>
          {title ?? (
            <>
              <span className={styles['file-preview-icon']}>{getFileIcon(resolvedFile.name, resolvedFile.mimeType)}</span>
              <span>{resolvedFile.name}</span>
              <span className={styles['file-preview-meta']}>
                {getFileTypeName(resolvedFile.name, resolvedFile.mimeType)}
                {resolvedFile.size != null && ` · ${formatFileSize(resolvedFile.size)}`}
              </span>
            </>
          )}
        </div>
        {extra}
        {previewUrl && (
          <Button type="link" icon={<CloudDownload />} href={previewUrl} target="_blank" rel="noreferrer">
            下载
          </Button>
        )}
      </div>
      <div className={classNames('file-preview-body', styles['file-preview-body'])}>
        {!previewUrl && <Empty description="无可预览地址" />}
        {previewUrl && isImage(resolvedFile) && (
          <Image src={previewUrl} alt={resolvedFile.name} className={styles['file-preview-image']} />
        )}
        {previewUrl && !isImage(resolvedFile) && (
          <iframe src={previewUrl} title={resolvedFile.name} className={styles['file-preview-iframe']} />
        )}
        {previewUrl && !isImage(file) && unsupportedMessage && (
          <p className={styles['file-preview-unsupported']}>{unsupportedMessage}</p>
        )}
      </div>
    </div>
  );
};

export default FilePreview;
