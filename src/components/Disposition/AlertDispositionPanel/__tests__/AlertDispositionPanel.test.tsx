import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AlertDispositionPanel from '../index';

describe('AlertDispositionPanel', () => {
  it('open=false 不渲染', () => {
    const html = renderToStaticMarkup(
      createElement(
        AlertDispositionPanel,
        {
          open: false,
          context: { kind: 'warn', label: '预警', date: '2026-09-10' },
        },
        createElement('span', null, '处置'),
      ),
    );
    expect(html).toBe('');
  });

  it('open+context 可见触发文案与 children', () => {
    const html = renderToStaticMarkup(
      createElement(
        AlertDispositionPanel,
        {
          open: true,
          context: {
            kind: 'alarm',
            label: '报警',
            date: '2026-09-10',
            detail: '差距 75%',
          },
        },
        createElement('span', null, '处置条'),
      ),
    );
    expect(html).toContain('触发：报警 · 2026-09-10 · 差距 75%');
    expect(html).toContain('处置条');
  });

  it('open 但 context 为空不渲染', () => {
    const html = renderToStaticMarkup(
      createElement(
        AlertDispositionPanel,
        { open: true, context: null },
        createElement('span', null, '处置'),
      ),
    );
    expect(html).toBe('');
  });

  it('传入 tone 时渲染色标 Tag', () => {
    const html = renderToStaticMarkup(
      createElement(
        AlertDispositionPanel,
        {
          open: true,
          context: { kind: 'critical', label: '三级严重', tone: '#ef4444' },
          onCollapse: () => undefined,
        },
        createElement('span', null, '处置'),
      ),
    );
    expect(html).toContain('alert-disposition-tone');
    expect(html).toContain('三级严重');
    expect(html).toContain('触发：三级严重');
  });
});
