import React from 'react';
import {
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Presentation,
} from '@/components/Icons';
import type { FileDisplayItem } from './types';

const EXT_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  md: FileText,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  ppt: Presentation,
  pptx: Presentation,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  webp: FileImage,
  zip: FileArchive,
  rar: FileArchive,
  '7z': FileArchive,
};

export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : '';
}

/** 从 URL 路径解析文件名（decodeURIComponent，失败时回退为「未命名文件」） */
export function parseFileNameFromUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '未命名文件';

  try {
    const pathname = new URL(trimmed, 'http://placeholder.local').pathname;
    const segment = pathname.split('/').filter(Boolean).pop() ?? '';
    const decoded = decodeURIComponent(segment);
    if (decoded) return decoded;
  } catch {
    // fall through
  }

  const fallback = trimmed.split(/[/?#]/).filter(Boolean).pop() ?? '';
  try {
    const decoded = decodeURIComponent(fallback);
    return decoded || '未命名文件';
  } catch {
    return fallback || '未命名文件';
  }
}

/** 补全 name / extension：name 缺省时从 url 解析 */
export function normalizeFileDisplayItem(file: FileDisplayItem): FileDisplayItem & { name: string } {
  const name = file.name?.trim() || (file.url ? parseFileNameFromUrl(file.url) : '未命名文件');
  const extension = file.extension ?? getFileExtension(name);

  return {
    ...file,
    name,
    extension: extension || file.extension,
  };
}

export function getFileIcon(name: string, _mimeType?: string): React.ReactNode {
  const ext = getFileExtension(name);
  const Icon = EXT_ICON_MAP[ext] ?? File;
  return <Icon />;
}

export function getFileTypeName(name: string, mimeType?: string): string {
  const ext = getFileExtension(name);
  if (ext) return ext.toUpperCase();
  if (mimeType) return mimeType.split('/').pop()?.toUpperCase() ?? 'FILE';
  return 'FILE';
}
