import DOMPurify from 'isomorphic-dompurify';
import type { Config } from 'dompurify';

/** CKEditor 常用标签白名单；禁 script / 事件属性 */
const INBOX_HTML_CONFIG: Config = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'span', 'div', 'a'],
  ALLOWED_ATTR: ['style', 'class', 'href', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
};

/**
 * 站内信 bodyHtml → 安全 HTML（isomorphic-dompurify，浏览器与 Node/单测一致）。
 * 空串返回 ''。
 */
export function sanitizeInboxHtml(raw: string | null | undefined): string {
  const src = String(raw || '').trim();
  if (!src) return '';
  return DOMPurify.sanitize(src, INBOX_HTML_CONFIG);
}
