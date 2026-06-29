import { describe, expect, it } from 'vitest';
import { getPreviewKind } from '../previewKind';

describe('getPreviewKind', () => {
  it('recognizes excel when extension has leading dot', () => {
    expect(getPreviewKind({ id: '1', name: 'report.xlsx', extension: '.xlsx' })).toBe('excel');
  });

  it('recognizes word when extension has leading dot', () => {
    expect(getPreviewKind({ id: '2', name: 'doc.docx', extension: '.docx' })).toBe('word');
  });

  it('recognizes excel from filename without extension field', () => {
    expect(getPreviewKind({ id: '3', name: 'data.xls' })).toBe('excel');
  });

  it('falls back to iframe for unknown extensions', () => {
    expect(getPreviewKind({ id: '4', name: 'archive.7z', extension: '.7z' })).toBe('iframe');
  });
});
