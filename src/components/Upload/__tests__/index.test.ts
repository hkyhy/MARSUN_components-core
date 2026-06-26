import { describe, it, expect } from 'vitest';

// Test the utility functions extracted from Upload component
// These are the pure functions defined inline in the component

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 / 1024).toFixed(0)}M`;
  return `${(bytes / 1024 ** 3).toFixed(1)}G`;
}

function getExt(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx + 1).toUpperCase() : '';
}

describe('Upload utils', () => {
  describe('formatSize', () => {
    it('formats bytes to KB', () => {
      expect(formatSize(512)).toBe('1KB');
      expect(formatSize(1024)).toBe('1KB');
      expect(formatSize(1024 * 512)).toBe('512KB');
    });

    it('formats bytes to MB', () => {
      expect(formatSize(1024 * 1024)).toBe('1M');
      expect(formatSize(1024 * 1024 * 100)).toBe('100M');
    });

    it('formats bytes to GB', () => {
      expect(formatSize(1024 ** 3)).toBe('1.0G');
      expect(formatSize(1024 ** 3 * 2.5)).toBe('2.5G');
    });
  });

  describe('getExt', () => {
    it('extracts extension from filename', () => {
      expect(getExt('document.pdf')).toBe('PDF');
      expect(getExt('archive.tar.gz')).toBe('GZ');
    });

    it('returns empty string for no extension', () => {
      expect(getExt('README')).toBe('');
    });

    it('handles dot at start', () => {
      expect(getExt('.gitignore')).toBe('GITIGNORE');
    });
  });
});
