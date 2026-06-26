/** 上传组件配置 */
export const UPLOAD_CONFIG = {
  /** 最大文件数 */
  maxCount: 5,
  /** 最大文件大小（50MB） */
  maxSize: 50 * 1024 * 1024,
  /** 允许的文件类型 */
  accept: '.pdf,.doc,.docx,.xlsx,.png,.jpg',
  /** 允许的文件类型描述 */
  acceptText: 'PDF、Word、Excel、图片',
} as const;

/** Mock 已上传文件列表 */
export const MOCK_FILE_LIST = [
  { uid: '1', name: '报告.pdf', status: 'done' as const, url: '#' },
  { uid: '2', name: '方案.docx', status: 'done' as const, url: '#' },
];
