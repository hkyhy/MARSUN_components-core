import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FileTags from '../FileTags';

describe('FileTags', () => {
  it('renders empty placeholder when tags is empty', () => {
    render(<FileTags tags={[]} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders null when tags is empty and empty is null', () => {
    const { container } = render(<FileTags tags={[]} empty={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders all tags when showLength is not provided', () => {
    render(<FileTags tags={['钉钉', '录屏', '教程']} />);
    expect(screen.getByText('钉钉')).toBeInTheDocument();
    expect(screen.getByText('录屏')).toBeInTheDocument();
    expect(screen.getByText('教程')).toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  it('renders all tags when tags count does not exceed showLength', () => {
    render(<FileTags tags={['钉钉', '录屏']} showLength={2} />);
    expect(screen.getByText('钉钉')).toBeInTheDocument();
    expect(screen.getByText('录屏')).toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  it('truncates tags and shows overflow count when exceeding showLength', () => {
    render(<FileTags tags={['钉钉', '录屏', '教程', '操作演示', '会议']} showLength={2} />);
    expect(screen.getByText('钉钉')).toBeInTheDocument();
    expect(screen.getByText('录屏')).toBeInTheDocument();
    expect(screen.queryByText('教程')).not.toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('falls back to showing all tags when showLength is invalid', () => {
    render(<FileTags tags={['钉钉', '录屏', '教程']} showLength={0} />);
    expect(screen.getByText('钉钉')).toBeInTheDocument();
    expect(screen.getByText('录屏')).toBeInTheDocument();
    expect(screen.getByText('教程')).toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });
});
