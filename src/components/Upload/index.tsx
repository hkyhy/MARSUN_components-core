import { Trash2, File, Inbox, Upload as UploadIcon } from '@/components/Icons';
import { Button, message, Tag, Typography, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React from 'react';
import styles from './style.module.scss';
import classNames from 'classnames';

/* ---------- types ---------- */

/** 上传变体 */
export type UploadVariant = 'panel' | 'button';

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

/* ---------- 子组件：已上传文件列表 ---------- */

interface UploadedFilesProps {
  fileList: UploadFile[];
  onRemove: (uid: string) => void;
}

const UploadedFiles: React.FC<UploadedFilesProps> = ({ fileList, onRemove }) => {
  if (!fileList.length) return null;

  return (
    <div className={classNames('upload-link', styles['upload-link'])}>
      {fileList.map((file) => (
        <div
          key={file.uid}
          className={classNames(
            classNames('upload-file-row', styles['upload-file-row']),
            file.status === 'error' && classNames('upload-file-row-error', styles['upload-file-row-error']),
          )}
        >
          <div className={classNames('upload-label', styles['upload-label'])}>
            <File className={classNames('upload-value', styles['upload-value'])} />
            <span className={classNames('upload-meta', styles['upload-meta'])}>{file.name}</span>
            <Tag color="processing" className={classNames('upload-icon', styles['upload-icon'])}>
              {getExt(file.name)}
            </Tag>
            {file.size && (
              <Typography.Text type="secondary" className={classNames('upload-title', styles['upload-title'])}>
                {formatSize(file.size)}
              </Typography.Text>
            )}
          </div>
          <Button
            type="text"
            danger
            size="small"
            icon={<Trash2 />}
            onClick={() => onRemove(file.uid)}
            className={classNames('upload-desc', styles['upload-desc'])}
          />
        </div>
      ))}
    </div>
  );
};

/* ---------- 主组件 ---------- */

/**
 * CommonUpload — 通用上传组件
 *
 * - 在 antd `<Form.Item>` 内使用时，通过 `value`/`onChange` 自动接入表单
 * - 独立使用时，通过 `onSave` 获取文件列表
 *
 * ## 两种变体
 *
 * - **`variant="button"`（默认）** — 虚线边框按钮 + 底部提示文案 + 已传文件列表
 * - **`variant="panel"`** — Dragger 拖拽面板 + 底部已传文件列表
 *
 * @example
 * ```tsx
 * // 在 Form.Item 中使用
 * <Form.Item name="files" label="简历附件" rules={[{ required: true, message: '请上传文件' }]}>
 *   <CommonUpload accept=".pdf,.jpg,.png" maxLength={10} />
 * </Form.Item>
 *
 * // 独立使用（Modal 内、非表单场景）
 * <CommonUpload variant="panel" accept=".doc,.pdf" onSave={(list) => setFiles(list)} />
 *
 * // ref 手动触发上传
 * const ref = useRef<CommonUploadRef>(null);
 * <CommonUpload ref={ref} onUpload={...} />;
 * ref.current?.upload();
 * ```
 */
const CommonUpload = React.forwardRef<CommonUploadRef, CommonUploadProps>(
  (
    {
      value,
      onChange,
      className,
      variant,
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
      (file: File): boolean => {
        if (getPermission && !getPermission(file)) {
          message.error('无权限上传此文件');
          return false;
        }
        if (file.size > effectiveFileSize) {
          message.error(`文件超出 ${formatSize(effectiveFileSize)} 限制`);
          return false;
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

    const tips = renderTips?.() ?? buildTips(accept, fileSize, maxLength);

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
            />
          )}
        </div>
      );
    }

    // button mode (default)
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
          />
        )}
      </div>
    );
  },
);

CommonUpload.displayName = 'CommonUpload';

export default CommonUpload;
