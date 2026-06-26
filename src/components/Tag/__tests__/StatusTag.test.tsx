import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemberStatusTag, ReviewStatusTag, RoleTag } from '../StatusTag';

vi.mock('@/constants', () => ({
  MEMBER_STATUS_MAP: {
    ACTIVE: { label: '在职', color: 'success' },
    ON_LEAVE: { label: '休假', color: 'warning' },
    RESIGNED: { label: '离职', color: 'danger' },
    DELETED: { label: '已删除', color: 'danger' },
  },
  REVIEW_STATUS_MAP: {
    APPROVED: { label: '已通过', color: 'success' },
    REJECTED: { label: '已驳回', color: 'danger' },
    PENDING_REVIEWER: { label: '待审核', color: 'processing' },
  },
}));

vi.mock('@/stores/roleOptionsStore', () => ({
  getRoleLabel: (key: string) =>
    ({ SYSTEM_ADMIN: '系统管理员', NORMAL_USER: '普通用户' })[key] ?? key,
}));

describe('MemberStatusTag', () => {
  it('renders known status with label', () => {
    render(<MemberStatusTag status="ACTIVE" />);
    expect(screen.getByText('在职')).toBeInTheDocument();
  });

  it('renders unknown status as raw text', () => {
    render(<MemberStatusTag status="UNKNOWN" />);
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });
});

describe('ReviewStatusTag', () => {
  it('renders known status', () => {
    render(<ReviewStatusTag status="APPROVED" />);
    expect(screen.getByText('已通过')).toBeInTheDocument();
  });

  it('renders unknown status', () => {
    render(<ReviewStatusTag status="DRAFT" />);
    expect(screen.getByText('DRAFT')).toBeInTheDocument();
  });
});

describe('RoleTag', () => {
  it('renders known role label', () => {
    render(<RoleTag role="SYSTEM_ADMIN" />);
    expect(screen.getByText('系统管理员')).toBeInTheDocument();
  });

  it('renders unknown role as raw text', () => {
    render(<RoleTag role="GUEST" />);
    expect(screen.getByText('GUEST')).toBeInTheDocument();
  });

  it('prefers roleName over role key', () => {
    render(<RoleTag role="CUSTOM_HIGN" roleName="高级用户" />);
    expect(screen.getByText('高级用户')).toBeInTheDocument();
  });
});
