import { describe, expect, it } from 'vitest';
import { normalizeFileDisplayItem, parseFileNameFromUrl } from '../fileDisplay';

describe('parseFileNameFromUrl', () => {
  it('parses filename from absolute URL path', () => {
    expect(parseFileNameFromUrl('https://cdn.example.com/files/report%202024.pdf')).toBe('report 2024.pdf');
  });

  it('parses filename from path-only URL', () => {
    expect(parseFileNameFromUrl('/assets/logo-MARSUN.png')).toBe('logo-MARSUN.png');
  });

  it('falls back when URL has no segment', () => {
    expect(parseFileNameFromUrl('')).toBe('未命名文件');
  });
});

describe('normalizeFileDisplayItem', () => {
  it('keeps explicit name', () => {
    expect(
      normalizeFileDisplayItem({ id: '1', name: 'demo.pdf', url: 'https://x.com/other.png' }).name,
    ).toBe('demo.pdf');
  });

  it('derives name from url when name is missing', () => {
    expect(
      normalizeFileDisplayItem({
        id: '2',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      }).name,
    ).toBe('dummy.pdf');
  });

  it('strips leading dot from extension', () => {
    expect(
      normalizeFileDisplayItem({ id: '3', name: 'a.xlsx', extension: '.xlsx' }).extension,
    ).toBe('xlsx');
  });
});
