import { SEMANTIC_COLORS } from '@/components/Tag/SemanticTag';
import { getFileExtension, normalizeExtension } from './fileDisplay';
import type { FileDisplayItem } from './types';

export type PreviewKind =
  | 'image'
  | 'pdf'
  | 'excel'
  | 'word'
  | 'ppt'
  | 'video'
  | 'audio'
  | 'text'
  | 'iframe'
  | 'unsupported';

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'];
const PDF_EXTS = ['pdf'];
const EXCEL_EXTS = ['xls', 'xlsx', 'csv'];
const WORD_EXTS = ['doc', 'docx'];
const PPT_EXTS = ['ppt', 'pptx'];
const VIDEO_EXTS = ['mp4', 'webm', 'mov', 'm4v'];
const AUDIO_EXTS = ['mp3', 'wav', 'ogg', 'aac', 'flac'];
const TEXT_EXTS = ['txt', 'md', 'json', 'xml', 'html', 'htm', 'log', 'yaml', 'yml'];

export function getPreviewKind(file: FileDisplayItem): PreviewKind {
  const mime = file.mimeType ?? '';
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';

  const ext = normalizeExtension(file.extension) || getFileExtension(file.name ?? '');
  if (IMAGE_EXTS.includes(ext)) return 'image';
  if (PDF_EXTS.includes(ext)) return 'pdf';
  if (EXCEL_EXTS.includes(ext)) return 'excel';
  if (WORD_EXTS.includes(ext)) return 'word';
  if (PPT_EXTS.includes(ext)) return 'ppt';
  if (VIDEO_EXTS.includes(ext)) return 'video';
  if (AUDIO_EXTS.includes(ext)) return 'audio';
  if (TEXT_EXTS.includes(ext)) return 'text';
  return 'iframe';
}

export function getFileTypeTagColor(kind: PreviewKind): string {
  switch (kind) {
    case 'pdf':
      return SEMANTIC_COLORS.INFO;
    case 'word':
      return SEMANTIC_COLORS.PROCESSING;
    case 'excel':
      return SEMANTIC_COLORS.SUCCESS;
    case 'ppt':
      return SEMANTIC_COLORS.WARNING;
    case 'image':
      return SEMANTIC_COLORS.CYAN;
    case 'video':
    case 'audio':
      return SEMANTIC_COLORS.PRIMARY;
    case 'text':
      return SEMANTIC_COLORS.DEFAULT;
    default:
      return SEMANTIC_COLORS.DEFAULT;
  }
}

/** Office / 文本类需 fetch blob 后客户端渲染，避免 iframe 触发下载 */
export function needsBlobPreview(kind: PreviewKind): boolean {
  return ['excel', 'word', 'ppt', 'text'].includes(kind);
}
