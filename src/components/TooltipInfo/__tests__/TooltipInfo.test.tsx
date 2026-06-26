import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import TooltipInfo from '../TooltipInfo';

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
});
