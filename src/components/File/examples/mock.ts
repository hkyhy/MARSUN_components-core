import type { FileDisplayItem } from '@/components/File/types';
import logoUrl from '@/assets/logo-MARSUN.png?url';
import pdfUrl from '@/assets/a1_副本4.pdf?url';
import xlsxUrl from '@/assets/客户.xlsx?url';
import pptxUrl from '@/assets/PPT生成组件测试模板.pptx?url';
import docUrl from '@/assets/焦点课题申请书.doc?url';
import videoUrl from '@/assets/视频.mp4?url';

const REMOTE_PDF_URL =
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
const REMOTE_IMAGE_URL = 'https://picsum.photos/seed/marsun-file/640/360';

/** 示例文件：src/assets 本地资源 + 远程 URL（含仅 url、自动解析文件名） */
export const mockFileItems: FileDisplayItem[] = [
  {
    id: 'asset-logo',
    name: 'logo-MARSUN.png',
    mimeType: 'image/png',
    url: logoUrl,
    tags: ['本地', '图片'],
  },
  {
    id: 'asset-pdf',
    name: 'a1_副本4.pdf',
    mimeType: 'application/pdf',
    url: pdfUrl,
    tags: ['本地', 'PDF'],
  },
  {
    id: 'asset-xlsx',
    name: '客户.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    url: xlsxUrl,
    tags: ['本地', '表格'],
  },
  {
    id: 'asset-pptx',
    name: 'PPT生成组件测试模板.pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    url: pptxUrl,
    tags: ['本地', '演示'],
  },
  {
    id: 'asset-doc',
    name: '焦点课题申请书.doc',
    mimeType: 'application/msword',
    url: docUrl,
    tags: ['本地', '文档'],
  },
  {
    id: 'asset-video',
    name: '视频.mp4',
    mimeType: 'video/mp4',
    url: videoUrl,
    tags: ['本地', '视频'],
  },
  {
    id: 'remote-pdf',
    url: REMOTE_PDF_URL,
    mimeType: 'application/pdf',
    tags: ['远程', 'URL 解析'],
  },
  {
    id: 'remote-image',
    url: REMOTE_IMAGE_URL,
    mimeType: 'image/jpeg',
    tags: ['远程', 'URL 解析'],
  },
];

export const mockUrlOnlyFileItems = mockFileItems.filter((item) => !item.name);
