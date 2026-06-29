import { Modal } from 'antd';
import React from 'react';
import FilePreview from '../FilePreview';
import { normalizeFileDisplayItem } from '../fileDisplay';
import type { FileDisplayItem } from '../types';

export interface FilePreviewModalProps {
  open: boolean;
  file: FileDisplayItem;
  url?: string;
  downloadUrl?: string;
  onDownload?: (file: FileDisplayItem) => void;
  unsupportedMessage?: string;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  open,
  file,
  url,
  downloadUrl,
  onDownload,
  unsupportedMessage,
  onClose,
}) => {
  const resolvedFile = normalizeFileDisplayItem(file);

  return (
  <Modal
    open={open}
    onCancel={onClose}
    footer={null}
    width={900}
    destroyOnHidden
    title="文件预览"
    styles={{ body: { paddingTop: 12 } }}
  >
    <FilePreview
      file={resolvedFile}
      url={url}
      downloadUrl={downloadUrl}
      onDownload={onDownload}
      unsupportedMessage={unsupportedMessage}
    />
  </Modal>
  );
};

export default FilePreviewModal;
