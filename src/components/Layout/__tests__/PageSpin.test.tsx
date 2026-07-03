import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PageSpin from '../PageSpin';

describe('PageSpin', () => {
  it('renders children when not spinning', () => {
    render(
      <PageSpin spinning={false}>
        <span>content</span>
      </PageSpin>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
