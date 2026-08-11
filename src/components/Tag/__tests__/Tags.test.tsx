import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SEMANTIC_COLORS } from '../SemanticTag';
import Tags from '../Tags';

describe('Tags', () => {
  it('renders empty placeholder when tags is empty', () => {
    render(<Tags tags={[]} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders null when tags is empty and empty is null', () => {
    const { container } = render(<Tags tags={[]} empty={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders all tags when showLength is not provided', () => {
    render(<Tags tags={['钉钉', '录屏', '教程']} />);
    expect(screen.getByText('钉钉')).toBeInTheDocument();
    expect(screen.getByText('录屏')).toBeInTheDocument();
    expect(screen.getByText('教程')).toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  it('renders all tags when tags count does not exceed showLength', () => {
    const { container } = render(<Tags tags={['钉钉', '录屏']} showLength={2} />);
    const visible = container.querySelector('.tags-tag-list');
    expect(visible?.textContent).toContain('钉钉');
    expect(visible?.textContent).toContain('录屏');
    expect(visible?.textContent).not.toContain('+');
  });

  it('keeps two long tags visible under showLength (compact ellipsis via CSS)', () => {
    const { container } = render(
      <Tags tags={['系统管理员', 'S3 系统管理员 (配置落地)']} showLength={2} />,
    );
    const visible =
      container.querySelector('.tags-tag-list-nowrap') || container.querySelector('.tags-tag-list');
    expect(visible?.textContent).toContain('系统管理员');
    expect(visible?.textContent).toContain('S3 系统管理员 (配置落地)');
    expect(visible?.textContent).not.toContain('+');
  });

  it('truncates tags and shows overflow count when exceeding showLength', () => {
    const { container } = render(
      <Tags tags={['钉钉', '录屏', '教程', '操作演示', '会议']} showLength={2} />,
    );
    const visible =
      container.querySelector('.tags-tag-list-nowrap') || container.querySelector('.tags-tag-list');
    expect(visible?.textContent).toContain('钉钉');
    expect(visible?.textContent).toContain('录屏');
    expect(visible?.textContent).toContain('+3');
    expect(visible?.textContent).not.toContain('教程');
  });

  it('falls back to showing all tags when showLength is invalid', () => {
    const { container } = render(<Tags tags={['钉钉', '录屏', '教程']} showLength={0} />);
    const visible = container.querySelector('.tags-tag-list');
    expect(visible?.textContent).toContain('钉钉');
    expect(visible?.textContent).toContain('录屏');
    expect(visible?.textContent).toContain('教程');
    expect(visible?.textContent).not.toContain('+');
  });

  it('applies custom color', () => {
    render(<Tags tags={['成功']} color={SEMANTIC_COLORS.SUCCESS} />);
    expect(screen.getByText('成功')).toBeInTheDocument();
  });
});
