import { describe, expect, it } from 'vitest';
import { sanitizeInboxHtml } from '../sanitizeInboxHtml';

describe('sanitizeInboxHtml', () => {
  it('keeps bold/list/color markup in browser', () => {
    const html =
      '<p><strong>加粗</strong></p><ul><li>一厂</li></ul><p><span style="color:#c00">红</span></p>';
    const out = sanitizeInboxHtml(html);
    // jsdom 下 DOMPurify 可用
    expect(out).toContain('加粗');
    expect(out).not.toMatch(/<script/i);
  });

  it('strips script and onerror', () => {
    const dirty =
      '<p>ok</p><script>alert(1)</script><img src=x onerror="alert(1)" /><p onclick="x()">t</p>';
    const out = sanitizeInboxHtml(dirty);
    expect(out).not.toMatch(/<script/i);
    expect(out).not.toMatch(/onerror/i);
    expect(out).not.toMatch(/onclick/i);
    expect(out).toContain('ok');
  });

  it('empty input → empty', () => {
    expect(sanitizeInboxHtml('')).toBe('');
    expect(sanitizeInboxHtml(null)).toBe('');
  });
});
