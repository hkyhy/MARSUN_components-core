import { Trash2, File, Inbox, Plus, Upload as UploadIcon } from '@/components/Icons';
import { SEMANTIC_COLORS, SemanticTag } from '@/components/Tag';
import { Button, Image, message, Typography, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

/* ---------- types ---------- */

/** 上传变体 */
export type UploadVariant = 'panel' | 'button';

/** 已选文件列表样式：text=行列表；picture-card=图片卡片（含预览） */
export type UploadListType = 'text' | 'picture-card';

export interface CommonUploadProps {
  /* ---- antd Form.Item 兼容属性 ---- */
  value?: UploadFile[];
  onChange?: (value: UploadFile[]) => void;

  /* ---- 容器/样式 ---- */
  className?: string;

  /* ---- 上传配置 ---- */
  /** 单文件大小限制（字节），默认 500MB */
  fileSize?: number;
  /** 最大上传数量 */
  maxLength?: number;
  multiple?: boolean;
  /** 目录上传模式（webkitdirectory），选中整个文件夹并保留 webkitRelativePath */
  directory?: boolean;
  size?: 'small' | 'middle' | 'large';
  accept?: string;

  /* ---- UI 变体 ---- */
  /** panel = 拖拽面板（Dragger 样式），button = 按钮（默认） */
  variant?: UploadVariant;
  /** 列表展现；图片场景用 picture-card（预览+缩略图） */
  listType?: UploadListType;
  children?: React.ReactNode;
  renderTips?: () => React.ReactNode;

  /* ---- 文件列表展示 ---- */
  /** 是否展示已上传文件列表，默认 true（tips 下方） */
  showFileList?: boolean;

  /* ---- 回调 ---- */
  onSave?: (fileList: UploadFile[]) => void;
  ossUpload?: boolean;
  onUpload?: (options: {
    file: File;
    onSuccess: (url?: string) => void;
    onError: (err: Error) => void;
  }) => Promise<void> | void;
  getPermission?: (file: File) => boolean;
  concurrentCount?: number;
}

export type CommonUploadRef = {
  upload: () => void;
  uploading: boolean;
};

/* ---------- utils ---------- */

const formatSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 / 1024).toFixed(0)}M`;
  return `${(bytes / 1024 ** 3).toFixed(1)}G`;
};

function buildTips(accept?: string, fileSize?: number, maxLength?: number): React.ReactNode {
  const parts: string[] = [];
  if (accept) {
    const exts = accept
      .split(',')
      .map((s) => s.trim().replace(/^\./, ''))
      .filter(Boolean);
    if (exts.length) parts.push(`支持扩展名${exts.join(',')}`);
  }
  if (fileSize) parts.push(`单个文件大小不超过${formatSize(fileSize)}`);
  if (maxLength) parts.push(`最多上传${maxLength}个附件`);
  return parts.length ? (
    <Typography.Text type="secondary" className={classNames('upload-item', styles['upload-item'])}>
      {parts.join('，')}
    </Typography.Text>
  ) : null;
}

function getExt(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx + 1).toUpperCase() : '';
}

function resolvePreviewUrl(file: UploadFile): string {
  if (file.url) return file.url;
  if (file.thumbUrl) return file.thumbUrl;
  if (file.originFileObj) return URL.createObjectURL(file.originFileObj);
  return '';
}

/* ---------- 子组件：文本行列表 ---------- */

interface UploadedFilesProps {
  fileList: UploadFile[];
  onRemove: (uid: string) => void;
  onPreview?: (file: UploadFile) => void;
}

const UploadedFiles: React.FC<UploadedFilesProps> = ({ fileList, onRemove, onPreview }) => {
  if (!fileList.length) return null;

  return (
    <div className={classNames('upload-link', styles['upload-link'])}>
      {fileList.map((file) => {
        const previewable = Boolean(
          file.url || file.thumbUrl || file.originFileObj?.type?.startsWith('image/'),
        );
        return (
          <div
            key={file.uid}
            className={classNames(
              classNames('upload-file-row', styles['upload-file-row']),
              file.status === 'error' &&
                classNames('upload-file-row-error', styles['upload-file-row-error']),
            )}
          >
            <div className={classNames('upload-label', styles['upload-label'])}>
              {file.thumbUrl || (file.url && file.type?.startsWith('image/')) ? (
                <button
                  type="button"
                  className={classNames('upload-thumb-btn', styles['upload-thumb-btn'])}
                  onClick={() => onPreview?.(file)}
                  title="预览"
                >
                  <img
                    className={classNames('upload-thumb', styles['upload-thumb'])}
                    src={file.thumbUrl || file.url}
                    alt={file.name}
                  />
                </button>
              ) : (
                <File className={classNames('upload-value', styles['upload-value'])} />
              )}
              <span className={classNames('upload-meta', styles['upload-meta'])}>{file.name}</span>
              <SemanticTag
                color={SEMANTIC_COLORS.INFO}
                className={classNames('upload-icon', styles['upload-icon'])}
              >
                {getExt(file.name)}
              </SemanticTag>
              {file.size ? (
                <Typography.Text
                  type="secondary"
                  className={classNames('upload-title', styles['upload-title'])}
                >
                  {formatSize(file.size)}
                </Typography.Text>
              ) : null}
            </div>
            <div className={classNames('upload-row-actions', styles['upload-row-actions'])}>
              {previewable && onPreview ? (
                <Button type="link" size="small" onClick={() => onPreview(file)}>
                  预览
                </Button>
              ) : null}
              <Button
                type="text"
                danger
                size="small"
                icon={<Trash2 />}
                onClick={() => onRemove(file.uid)}
                className={classNames('upload-desc', styles['upload-desc'])}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ---------- 主组件 ---------- */

/**
 * CommonUpload — 通用上传组件
 *
 * - `listType="text"`（默认）：行列表；图片有缩略图时可「预览」
 * - `listType="picture-card"`：antd 图片卡片（内置预览/删除图标）
 */
const CommonUpload = React.forwardRef<CommonUploadRef, CommonUploadProps>(
  (
    {
      value,
      onChange,
      className,
      variant,
      listType = 'text',
      size,
      children,
      renderTips,
      showFileList = true,
      fileSize,
      maxLength,
      multiple,
      directory,
      accept,
      onUpload,
      onSave,
      getPermission,
      concurrentCount,
    },
    ref,
  ) => {
    const [innerFileList, setInnerFileList] = React.useState<UploadFile[]>([]);
    const [uploading, setUploading] = React.useState(false);
    const [preview, setPreview] = React.useState<{ open: boolean; url: string; title: string }>({
      open: false,
      url: '',
      title: '',
    });
    const blobUrlsRef = React.useRef<string[]>([]);

    // 受控模式：value 优先；非受控：内部状态
    const fileList = value ?? innerFileList;
    const setFileList = React.useCallback(
      (next: UploadFile[] | ((prev: UploadFile[]) => UploadFile[])) => {
        const resolved = typeof next === 'function' ? next(fileList) : next;
        onChange?.(resolved);
        setInnerFileList(resolved);
        onSave?.(resolved);
      },
      [fileList, onChange, onSave],
    );

    const effectiveFileSize = fileSize ?? 500 * 1024 * 1024;
    const concurrent = concurrentCount ?? 3;

    const beforeUploadFn = React.useCallback(
      (file: File) => {
        if (getPermission && !getPermission(file)) {
          message.error('无权限上传此文件');
          return Upload.LIST_IGNORE;
        }
        if (file.size > effectiveFileSize) {
          message.error(`文件超出 ${formatSize(effectiveFileSize)} 限制`);
          return Upload.LIST_IGNORE;
        }
        return true;
      },
      [effectiveFileSize, getPermission],
    );

    const triggerUpload = React.useCallback(async () => {
      if (!onUpload || !fileList.length) return;
      setUploading(true);
      try {
        const pending = [...fileList];
        const pool: Promise<void>[] = [];
        while (pending.length) {
          const item = pending.shift();
          if (!item?.originFileObj) continue;
          const rawFile = item.originFileObj;
          pool.push(
            new Promise<void>((resolve) => {
              onUpload({
                file: rawFile,
                onSuccess: (url?) => {
                  setFileList((prev) =>
                    prev.map((f) =>
                      f.uid === item.uid ? { ...f, status: 'done' as const, url: url ?? f.url } : f,
                    ),
                  );
                  resolve();
                },
                onError: (_err: Error) => {
                  message.error(`${item.name} 上传失败`);
                  setFileList((prev) =>
                    prev.map((f) => (f.uid === item.uid ? { ...f, status: 'error' as const } : f)),
                  );
                  resolve();
                },
              });
            }),
          );
          if (pool.length >= concurrent) await Promise.race(pool);
        }
        await Promise.allSettled(pool);
        onSave?.(fileList);
      } finally {
        setUploading(false);
      }
    }, [fileList, onUpload, concurrent, onSave, setFileList]);

    React.useImperativeHandle(ref, () => ({ upload: triggerUpload, uploading }), [
      triggerUpload,
      uploading,
    ]);

    const openPreview = React.useCallback((file: UploadFile) => {
      const url = resolvePreviewUrl(file);
      if (!url) {
        message.warning('暂无法预览该文件');
        return;
      }
      if (url.startsWith('blob:')) {
        blobUrlsRef.current.push(url);
      }
      setPreview({ open: true, url, title: file.name || '预览' });
    }, []);

    React.useEffect(
      () => () => {
        blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        blobUrlsRef.current = [];
      },
      [],
    );

    const tips = renderTips?.() ?? buildTips(accept, fileSize, maxLength);
    const canAddMore = !maxLength || fileList.length < maxLength;

    const previewNode = (
      <Image
        alt={preview.title}
        style={{ display: 'none' }}
        src={preview.url}
        preview={{
          visible: preview.open,
          src: preview.url,
          onVisibleChange: (visible) => setPreview((prev) => ({ ...prev, open: visible })),
        }}
      />
    );

    if (listType === 'picture-card') {
      return (
        <div
          className={classNames('upload-picture-root', styles['upload-picture-root'], className)}
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={beforeUploadFn}
            onChange={(info) => setFileList(info.fileList)}
            onPreview={openPreview}
            multiple={multiple}
            directory={directory}
            accept={accept}
            showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            customRequest={({ onSuccess }) => onSuccess?.({})}
            className={classNames('upload-picture-card', styles['upload-picture-card'])}
          >
            {canAddMore ? (
              <div
                className={classNames('upload-picture-trigger', styles['upload-picture-trigger'])}
              >
                <Plus size={20} />
                <div
                  className={classNames(
                    'upload-picture-trigger-text',
                    styles['upload-picture-trigger-text'],
                  )}
                >
                  上传图片
                </div>
              </div>
            ) : null}
          </Upload>
          {tips ? (
            <div className={classNames('upload-list', styles['upload-list'])}>{tips}</div>
          ) : null}
          {previewNode}
        </div>
      );
    }

    if (variant === 'panel') {
      return (
        <div className={className}>
          <Upload.Dragger
            fileList={fileList}
            beforeUpload={beforeUploadFn}
            onChange={(info) => setFileList(info.fileList)}
            multiple={multiple}
            directory={directory}
            accept={accept}
            showUploadList={false}
            customRequest={({ onSuccess }) => onSuccess?.({})}
          >
            <p className={classNames('upload-drag-icon', styles['upload-drag-icon'])}>
              <Inbox />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p>{tips}</p>
          </Upload.Dragger>
          {showFileList && (
            <UploadedFiles
              fileList={fileList}
              onRemove={(uid) => setFileList((prev) => prev.filter((f) => f.uid !== uid))}
              onPreview={openPreview}
            />
          )}
          {previewNode}
        </div>
      );
    }

    // button mode (default) + text list
    return (
      <div className={className}>
        <Upload
          fileList={fileList}
          beforeUpload={beforeUploadFn}
          onChange={(info) => setFileList(info.fileList)}
          multiple={multiple}
          directory={directory}
          accept={accept}
          showUploadList={false}
          customRequest={({ onSuccess }) => onSuccess?.({})}
        >
          {children ?? (
            <Button
              size={size}
              icon={<UploadIcon />}
              className={classNames('upload-toolbar', styles['upload-toolbar'])}
            >
              点击上传
            </Button>
          )}
        </Upload>
        <div className={classNames('upload-list', styles['upload-list'])}>{tips}</div>
        {showFileList && (
          <UploadedFiles
            fileList={fileList}
            onRemove={(uid) => setFileList((prev) => prev.filter((f) => f.uid !== uid))}
            onPreview={openPreview}
          />
        )}
        {previewNode}
      </div>
    );
  },
);

CommonUpload.displayName = 'CommonUpload';

export default CommonUpload;
