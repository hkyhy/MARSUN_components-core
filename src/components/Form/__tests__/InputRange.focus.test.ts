import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/**
 * 回归：InputRange 必须 render(稳定字段组件)，禁止每次渲染新建 Bound。
 * 否则 InputNumber 会随 onChange 卸载重建，输入一位就丢焦点。
 */
describe('InputRange focus stability', () => {
  it('does not create an inline Bound component for useDecorator', () => {
    const here = dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(join(here, '../InputRange.tsx'), 'utf8');
    expect(src).toMatch(/return render\(InputRangeField\)/);
    expect(src).not.toMatch(/const Bound/);
  });
});
