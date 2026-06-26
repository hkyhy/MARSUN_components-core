import type { FileDisplayItem } from '../types';
import { getFileIcon, getFileTypeName, normalizeFileDisplayItem } from '../fileDisplay';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface FileLinkProps {
  file: FileDisplayItem;
  onClick?: (file: FileDisplayItem) => void;
}

const FileLink: React.FC<FileLinkProps> = ({ file, onClick }) => {
  const resolvedFile = normalizeFileDisplayItem(file);

  return (
  <a
    className={classNames('file-link-actions', styles['file-link-actions'])}
    onClick={(e) => { e.preventDefault(); onClick?.(resolvedFile); }}
    href={resolvedFile.url ?? '#'}
    title={resolvedFile.name}
  >
    <span className={styles['file-link-inner']}>{getFileIcon(resolvedFile.name, resolvedFile.mimeType)}</span>
    <span className={styles['file-link-toolbar']}>{resolvedFile.name}</span>
    <span className={styles['file-link-row']}>{getFileTypeName(resolvedFile.name, resolvedFile.mimeType)}</span>
  </a>
  );
};

export default FileLink;
