import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CommonDescriptions, { type DescriptionItem } from '../CommonDescriptions';

describe('CommonDescriptions', () => {
  const items: DescriptionItem[] = [
    { label: '姓名', value: '张三' },
    { label: '部门', value: '技术部' },
    { label: '备注', value: '无', span: 2 },
  ];

  it('renders all label-value pairs', () => {
    render(<CommonDescriptions content={items} />);
    expect(screen.getByText('姓名')).toBeInTheDocument();
    expect(screen.getByText('张三')).toBeInTheDocument();
    expect(screen.getByText('部门')).toBeInTheDocument();
    expect(screen.getByText('技术部')).toBeInTheDocument();
  });

  it('renders title and extra', () => {
    render(<CommonDescriptions content={items} title="用户信息" extra={<button>编辑</button>} />);
    expect(screen.getByText('用户信息')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '编辑' })).toBeInTheDocument();
  });

  it('renders ReactNode values', () => {
    const itemsWithNode: DescriptionItem[] = [
      { label: '状态', value: <span data-testid="status-tag">活跃</span> },
    ];
    render(<CommonDescriptions content={itemsWithNode} />);
    expect(screen.getByTestId('status-tag')).toBeInTheDocument();
  });
});
