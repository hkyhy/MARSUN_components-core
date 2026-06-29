import type { FileDisplayItem } from '../types';
import { getFileIcon, getFileTypeName, normalizeFileDisplayItem } from '../fileDisplay';
import FilePreviewModal from '../FilePreviewModal';
import React, { useState } from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface FilePreviewLinkProps {
  file: FileDisplayItem;
  url?: string;
  downloadUrl?: string;
  onDownload?: (file: FileDisplayItem) => void;
  disabled?: boolean;
  showType?: boolean;
  className?: string;
}

const FilePreviewLink: React.FC<FilePreviewLinkProps> = ({
  file,
  url,
  downloadUrl,
  onDownload,
  disabled = false,
  showType = true,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const resolvedFile = normalizeFileDisplayItem(file);

  if (disabled) {
    return (
      <span
        className={classNames(styles['file-preview-link-disabled'], className)}
        title={resolvedFile.name}
      >
        <span className={styles['file-preview-link-inner']}>
          {getFileIcon(resolvedFile.name, resolvedFile.mimeType)}
        </span>
        <span className={styles['file-preview-link-name']}>{resolvedFile.name}</span>
        {showType && (
          <span className={styles['file-preview-link-type']}>
            {getFileTypeName(resolvedFile.name, resolvedFile.mimeType)}
          </span>
        )}
      </span>
    );
  }

  return (
    <>
      <a
        className={classNames('file-preview-link', styles['file-preview-link'], className)}
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        href={url ?? resolvedFile.url ?? '#'}
        title={resolvedFile.name}
      >
        <span className={styles['file-preview-link-inner']}>
          {getFileIcon(resolvedFile.name, resolvedFile.mimeType)}
        </span>
        <span className={styles['file-preview-link-name']}>{resolvedFile.name}</span>
        {showType && (
          <span className={styles['file-preview-link-type']}>
            {getFileTypeName(resolvedFile.name, resolvedFile.mimeType)}
          </span>
        )}
      </a>
      <FilePreviewModal
        open={open}
        file={resolvedFile}
        url={url}
        downloadUrl={downloadUrl}
        onDownload={onDownload}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default FilePreviewLink;
