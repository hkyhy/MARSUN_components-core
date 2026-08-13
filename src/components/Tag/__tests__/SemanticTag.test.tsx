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

  it('applies selected (inverse) style for theme color', () => {
    render(
      <SemanticTag color={SEMANTIC_COLORS.DANGER} selected>
        选中
      </SemanticTag>,
    );
    const tag = screen.getByText('选中').closest('.ant-tag');
    // 反白：背景取语义实色，文字反白，加粗，高度不变
    expect(tag!.style.backgroundColor).toBe('var(--error-color)');
    expect(tag!.style.color).toBe('#fff');
    expect(tag!.style.fontWeight).toBe('600');
    expect(tag!.style.height).toBe('24px');
  });

  it('applies selected (inverse) style for fixed color without layout shift', () => {
    render(
      <SemanticTag color={SEMANTIC_COLORS.PROCESSING} selected>
        进行中
      </SemanticTag>,
    );
    const tag = screen.getByText('进行中').closest('.ant-tag');
    expect(tag!.style.height).toBe('24px');
    expect(tag!.style.fontWeight).toBe('600');
    expect(tag!.style.color).toBe('#fff');
    expect(tag!.style.border).toMatch(/none/);
  });

  it('merges consumer style without overriding computed color', () => {
    render(
      <SemanticTag color={SEMANTIC_COLORS.PRIMARY} style={{ cursor: 'pointer' }}>
        可点
      </SemanticTag>,
    );
    const tag = screen.getByText('可点').closest('.ant-tag');
    expect(tag!.style.cursor).toBe('pointer');
    expect(tag!.style.color).toBe('var(--primary-color)');
    expect(tag!.style.backgroundColor).toBe('var(--primary-color-bg)');
  });

  it('does not apply selected style when selected is false', () => {
    render(<SemanticTag color={SEMANTIC_COLORS.PRIMARY}>未选</SemanticTag>);
    const tag = screen.getByText('未选').closest('.ant-tag');
    expect(tag!.style.backgroundColor).toBe('var(--primary-color-bg)');
    expect(tag!.style.color).toBe('var(--primary-color)');
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
