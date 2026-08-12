import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import TooltipInfo from '../TooltipInfo';

afterEach(() => {
  cleanup();
});

describe('TooltipInfo', () => {
  it('renders children when hidden', () => {
    render(
      <TooltipInfo hidden content={[{ label: '添加人', value: '管理员' }]}>
        <span>角色名称</span>
      </TooltipInfo>,
    );
    expect(screen.getByText('角色名称')).toBeInTheDocument();
  });

  it('renders children when content is empty', () => {
    render(
      <TooltipInfo content={[]}>
        <span>角色名称</span>
      </TooltipInfo>,
    );
    expect(screen.getByText('角色名称')).toBeInTheDocument();
  });

  it('renders children when note is missing (note type)', () => {
    render(
      <TooltipInfo type="note">
        <span>考核对照</span>
      </TooltipInfo>,
    );
    expect(screen.getByText('考核对照')).toBeInTheDocument();
  });

  it('renders note title and description (note type)', () => {
    render(
      <TooltipInfo
        type="note"
        open
        note={{ title: '考核对照 G-JZ（只读）', description: 'data-service 考核标准六表' }}
      >
        <span>考核对照 G-JZ</span>
      </TooltipInfo>,
    );
    expect(screen.getByText('考核对照 G-JZ')).toBeInTheDocument();
    expect(screen.getByText('考核对照 G-JZ（只读）')).toBeInTheDocument();
    expect(screen.getByText('data-service 考核标准六表')).toBeInTheDocument();
  });
});
