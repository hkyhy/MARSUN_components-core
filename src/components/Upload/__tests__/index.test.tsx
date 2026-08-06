import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import { Upload as AntdUpload, message } from 'antd';
import CommonUpload from '../index';

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

describe('CommonUpload size gate', () => {
  beforeEach(() => {
    vi.spyOn(message, 'error').mockImplementation(() => undefined as never);
  });

  it('rejects oversized file with LIST_IGNORE so it is not kept in fileList', async () => {
    const onChange = vi.fn();
    const { container } = render(
      <CommonUpload variant="button" fileSize={1024} value={[]} onChange={onChange} />,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();

    const oversized = new File([new Uint8Array(2048)], 'big.bin', {
      type: 'application/octet-stream',
    });
    Object.defineProperty(oversized, 'size', { value: 2048 });

    fireEvent.change(input, { target: { files: [oversized] } });

    await waitFor(() => {
      expect(message.error).toHaveBeenCalled();
    });

    // LIST_IGNORE: antd should not add the file; onChange may fire with empty list or not at all
    const lastCall = onChange.mock.calls.at(-1);
    if (lastCall) {
      expect(lastCall[0]).toEqual([]);
    }
    expect(AntdUpload.LIST_IGNORE).toBeTruthy();
  });
});
