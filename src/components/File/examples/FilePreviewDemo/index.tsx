import { FilePreview, FilePreviewModal } from '@/components';
import { Button, Card, Radio, Space } from 'antd';
import React, { useState } from 'react';
import { mockFileItems } from '../mock';
import styles from './style.module.scss';
import classNames from 'classnames';

const FilePreviewDemo: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<(typeof mockFileItems)[0] | null>(null);
  const [previewMode, setPreviewMode] = useState<'inline' | 'modal'>('inline');
  const [inlineFileId, setInlineFileId] = useState(mockFileItems[0]?.id ?? 'asset-logo');

  const handlePreview = (file: (typeof mockFileItems)[0]) => {
    setSelectedFile(file);
    if (previewMode === 'modal') {
      setOpen(true);
    }
    setInlineFileId(file.id);
  };

  const currentInlineFile = mockFileItems.find((f) => f.id === inlineFileId);

  return (
    <div className={classNames('file-preview-demo-stats', styles['file-preview-demo-stats'])}>
      <div>
        <h4 className={classNames('file-preview-demo-scroll', styles['file-preview-demo-scroll'])}>文件预览</h4>
        <Radio.Group
          value={previewMode}
          onChange={(e) => setPreviewMode(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="inline">直接展示预览</Radio.Button>
          <Radio.Button value="modal">弹窗预览</Radio.Button>
        </Radio.Group>
      </div>

      <p className={classNames('file-preview-demo-user-menu', styles['file-preview-demo-user-menu'])}>
        选择文件进行预览（部分格式需有效 URL）
      </p>
      <Space wrap>
        {mockFileItems.map((file) => (
          <Button
            key={file.id}
            size="small"
            type={file.id === inlineFileId ? 'primary' : 'default'}
            onClick={() => handlePreview(file)}
          >
            {file.name}
          </Button>
        ))}
      </Space>

      {previewMode === 'inline' && currentInlineFile && (
        <Card size="small" title={`${currentInlineFile.name} 预览`}>
          <FilePreview file={currentInlineFile} />
        </Card>
      )}

      {previewMode === 'modal' && selectedFile && (
        <FilePreviewModal
          open={open}
          file={selectedFile}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default FilePreviewDemo;
