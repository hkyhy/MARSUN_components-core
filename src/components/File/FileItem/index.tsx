import { FileTags } from '@/components/Tag';
import { Trash2, Download, Eye } from '@/components/Icons';
import { formatFileSize } from '@/utils/format';
import { Button, Tooltip } from 'antd';
import React, { useState } from 'react';
import FilePreviewModal from '../FilePreviewModal';
import { getFileIcon, getFileTypeName, normalizeFileDisplayItem } from '../fileDisplay';
import type { FileDisplayItem } from '../types';
import styles from './style.module.scss';
import classNames from 'classnames';

export interface FileItemAction {
  key: string;
  icon: React.ReactNode;
  tooltip: string;
  onClick: (file: FileDisplayItem) => void;
}

export interface FileItemProps {
  file: FileDisplayItem;
  status?: React.ReactNode;
  showDownload?: boolean;
  showDelete?: boolean;
  showPreview?: boolean;
  actions?: FileItemAction[];
  onDownload?: (file: FileDisplayItem) => void;
  onDelete?: (file: FileDisplayItem) => void;
  onPreview?: (file: FileDisplayItem) => void;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  status,
  showDownload = true,
  showDelete = false,
  showPreview = true,
  actions,
  onDownload,
  onDelete,
  onPreview,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const resolvedFile = normalizeFileDisplayItem(file);

  const handleDownload = () => {
    if (onDownload) {
      onDownload(resolvedFile);
      return;
    }
    if (resolvedFile.url) window.open(resolvedFile.url, '_blank');
  };

  const handlePreview = () => {
    if (onPreview) onPreview(resolvedFile);
    else setPreviewOpen(true);
  };

  const defaultActions: FileItemAction[] = [];
  if (showPreview) {
    defaultActions.push({
      key: 'preview',
      icon: <Eye />,
      tooltip: '预览',
      onClick: () => handlePreview(),
    });
  }
  if (showDownload) {
    defaultActions.push({
      key: 'download',
      icon: <Download />,
      tooltip: '下载',
      onClick: () => handleDownload(),
    });
  }
  if (showDelete && onDelete) {
    defaultActions.push({
      key: 'delete',
      icon: <Trash2 />,
      tooltip: '删除',
      onClick: () => onDelete(resolvedFile),
    });
  }

  const allActions = [...defaultActions, ...(actions ?? [])];
  const typeName = getFileTypeName(resolvedFile.name, resolvedFile.mimeType);

  return (
    <>
      <div className={classNames('file-item-root', styles['file-item-root'])}>
        <div className={classNames('file-item-container', styles['file-item-container'])}>
          <div className={classNames('file-item-wrapper', styles['file-item-wrapper'])}>
            <span className={classNames('file-item-inner', styles['file-item-inner'])}>
              {getFileIcon(resolvedFile.name, resolvedFile.mimeType)}
            </span>
            <div className={classNames('file-item-header', styles['file-item-header'])}>
              <div className={classNames('file-item-body', styles['file-item-body'])}>
                <span className={classNames('file-item-footer', styles['file-item-footer'])} title={resolvedFile.name}>
                  {resolvedFile.name}
                </span>
                <span className={classNames('file-item-row', styles['file-item-row'])}>{typeName}</span>
                {resolvedFile.size != null && (
                  <span className={classNames('file-item-row', styles['file-item-row'])}>
                    {formatFileSize(resolvedFile.size)}
                  </span>
                )}
              </div>
              {resolvedFile.tags && resolvedFile.tags.length > 0 && (
                <FileTags tags={resolvedFile.tags} className={classNames('file-item-col', styles['file-item-col'])} />
              )}
            </div>
          </div>

          <div className={classNames('file-item-wrap', styles['file-item-wrap'])}>
            {status && <span className={classNames('file-item-panel', styles['file-item-panel'])}>{status}</span>}
            <div className={classNames('file-item-action-group', styles['file-item-action-group'])}>
              {allActions.map((action) => (
                <Tooltip key={action.key} title={action.tooltip}>
                  <Button
                    type="text"
                    size="small"
                    icon={action.icon}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(file);
                    }}
                  />
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </div>
      <FilePreviewModal open={previewOpen} file={resolvedFile} onClose={() => setPreviewOpen(false)} />
    </>
  );
};

export { FileItem };
export default FileItem;
