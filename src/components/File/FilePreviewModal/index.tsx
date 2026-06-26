import { Modal } from 'antd';
import React from 'react';
import FilePreview from '../FilePreview';
import { normalizeFileDisplayItem } from '../fileDisplay';
import type { FileDisplayItem } from '../types';

export interface FilePreviewModalProps {
  open: boolean;
  file: FileDisplayItem;
  url?: string;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ open, file, url, onClose }) => {
  const resolvedFile = normalizeFileDisplayItem(file);

  return (
  <Modal open={open} onCancel={onClose} footer={null} width={900} destroyOnHidden title={resolvedFile.name}>
    <FilePreview file={resolvedFile} url={url} />
  </Modal>
  );
};

export default FilePreviewModal;
