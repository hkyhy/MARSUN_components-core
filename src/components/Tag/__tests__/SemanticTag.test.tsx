import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SemanticTag, { SEMANTIC_COLORS } from '../SemanticTag';

/** 辅助：将 hex/rgb 都转为可比较的格式 */
function normalizeColor(c: string): string {
  if (c.startsWith('#')) {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  return c;
}

describe('SemanticTag', () => {
  it('renders text content', () => {
    render(<SemanticTag>测试标签</SemanticTag>);
    expect(screen.getByText('测试标签')).toBeInTheDocument();
  });

  it('applies default color when no color specified', () => {
    render(<SemanticTag>默认</SemanticTag>);
    const tag = screen.getByText('默认').closest('.ant-tag');
    expect(normalizeColor(tag!.style.color)).toBe('rgb(102, 102, 102)');
  });

  it('applies semantic color', () => {
    render(<SemanticTag color={SEMANTIC_COLORS.SUCCESS}>成功</SemanticTag>);
    const tag = screen.getByText('成功').closest('.ant-tag');
    expect(tag!.style.color).toBe('var(--success-color)');
  });

  it('applies danger color', () => {
    render(<SemanticTag color={SEMANTIC_COLORS.DANGER}>危险</SemanticTag>);
    const tag = screen.getByText('危险').closest('.ant-tag');
    expect(tag!.style.color).toBe('var(--error-color)');
  });

  it('applies hex color directly', () => {
    render(<SemanticTag color="#ff0000">自定义</SemanticTag>);
    const tag = screen.getByText('自定义').closest('.ant-tag');
    expect(normalizeColor(tag!.style.color)).toBe('rgb(255, 0, 0)');
  });

  it('has consistent sizing style', () => {
    render(<SemanticTag>尺寸</SemanticTag>);
    const tag = screen.getByText('尺寸').closest('.ant-tag');
    expect(tag!.style.height).toBe('24px');
  });
});

describe('SEMANTIC_COLORS', () => {
  it('contains all expected keys', () => {
    const keys = Object.keys(SEMANTIC_COLORS);
    expect(keys).toContain('DEFAULT');
    expect(keys).toContain('INFO');
    expect(keys).toContain('PROCESSING');
    expect(keys).toContain('SUCCESS');
    expect(keys).toContain('WARNING');
    expect(keys).toContain('DANGER');
    expect(keys).toContain('VOLCANO');
    expect(keys).toContain('CYAN');
    expect(keys).toContain('GOLD');
    expect(keys).toContain('LIME');
  });
});
