import type { ReactNode } from 'react';

/** 把「」内文案加粗，供 toast / 摘要强调 */
export function emphasizeQuoted(text: string): ReactNode {
  const raw = String(text || '');
  if (!raw) return null;
  const parts = raw.split(/(「[^」]*」)/g);
  if (parts.length === 1) return raw;
  return parts.map((part, i) =>
    part.startsWith('「') && part.endsWith('」') ? <strong key={i}>{part}</strong> : part,
  );
}
