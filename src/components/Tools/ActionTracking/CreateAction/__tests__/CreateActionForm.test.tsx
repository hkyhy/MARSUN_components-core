import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Form } from '../../../../FormInfo';
import CreateActionForm from '../CreateActionForm';
import type { CreateActionLoaders } from '../types';

vi.mock('../../../../FormInfo', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../../FormInfo')>();
  const SuperSelectStub = (props: { name?: string; label?: string; placeholder?: string }) => (
    <div data-testid={`super-select-${props.name || 'x'}`}>
      <span>{props.label}</span>
      {props.placeholder ? <span>{props.placeholder}</span> : null}
    </div>
  );
  return { ...actual, SuperSelect: SuperSelectStub };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

beforeAll(() => {
  const proto = HTMLCanvasElement.prototype as HTMLCanvasElement & {
    getContext: (type: string) => unknown;
  };
  const original = proto.getContext;
  proto.getContext = function getContext(type: string) {
    const ctx = original.call(this, type);
    if (ctx) return ctx;
    return {
      font: '',
      measureText: () => ({ width: 0 }),
    };
  };
});

const dimensionOptions = [
  { value: 'process', label: '过程' },
  { value: 'result', label: '结果' },
];

function mockLoaders(overrides?: Partial<CreateActionLoaders>): CreateActionLoaders {
  return {
    loadAssigneeCatalog: vi.fn(async () => ({
      cascadeOptions: [
        {
          value: 'ROLE_A',
          label: '角色A',
          children: [{ value: 'u1', label: '用户1' }],
        },
      ],
      options: [{ value: 'u1', displayName: '用户1' }],
    })),
    loadAllocatorCatalog: vi.fn(async () => ({
      cascadeOptions: [
        {
          value: 'ROLE_B',
          label: '角色B',
          children: [{ value: 'a1', label: '分配1' }],
        },
      ],
      options: [{ value: 'a1', displayName: '分配1' }],
    })),
    loadFactoryOptions: vi.fn(async () => [{ value: 'F1', label: '一分厂' }]),
    loadVarietyPage: vi.fn(async () => ({
      pageData: [{ value: 'V1', label: '品种1' }],
      totalCount: 1,
    })),
    pickDefaultAllocatorUserId: () => 'a1',
    ...overrides,
  };
}

describe('CreateActionForm（T1 lockedContext / F4 placeholder）', () => {
  it('lockedContext 分支：渲染只读上下文，不出分厂/品种/关联指标', async () => {
    const loaders = mockLoaders();
    render(
      <Form onSubmit={() => undefined} data={{ lockedContext_0: '五分厂', lockedContext_1: 'A01' }}>
        <CreateActionForm
          dimensionOptions={dimensionOptions}
          loaders={loaders}
          titlePlaceholder="App 标题占位"
          lockedContext={[
            { label: '分厂', value: '五分厂' },
            { label: '机台', value: 'A01' },
          ]}
        />
      </Form>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('五分厂')).toBeTruthy();
      expect(screen.getByDisplayValue('A01')).toBeTruthy();
    });
    expect(screen.getByText('机台')).toBeTruthy();
    expect(screen.queryByText('关联指标')).toBeNull();
    expect(loaders.loadFactoryOptions).not.toHaveBeenCalled();
    expect(loaders.loadVarietyPage).not.toHaveBeenCalled();
  });

  it('F4：titlePlaceholder 由 props 注入', async () => {
    render(
      <Form onSubmit={() => undefined}>
        <CreateActionForm
          dimensionOptions={dimensionOptions}
          loaders={mockLoaders()}
          titlePlaceholder="排查用能 EI 偏高"
          metricPlaceholder="例如：EI"
        />
      </Form>,
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('排查用能 EI 偏高')).toBeTruthy();
      expect(screen.getByPlaceholderText('例如：EI')).toBeTruthy();
    });
  });

  it('scopeMode=none：不出分厂/品种/关联指标，不拉 factory/variety loader', async () => {
    const loaders = mockLoaders();
    render(
      <Form onSubmit={() => undefined}>
        <CreateActionForm
          dimensionOptions={dimensionOptions}
          loaders={loaders}
          scopeMode="none"
          noneScopeHint="业务上下文请从用能/保养/专件下发"
          titlePlaceholder="排查用能 EI 偏高"
        />
      </Form>,
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('排查用能 EI 偏高')).toBeTruthy();
    });
    expect(screen.queryByTestId('super-select-factory')).toBeNull();
    expect(screen.queryByTestId('super-select-variety')).toBeNull();
    expect(screen.queryByText('关联指标')).toBeNull();
    expect(screen.getByText('业务上下文请从用能/保养/专件下发')).toBeTruthy();
    expect(loaders.loadFactoryOptions).not.toHaveBeenCalled();
    expect(loaders.loadVarietyPage).not.toHaveBeenCalled();
  });

  it('scopeMode=form（默认）：渲染分厂与关联指标', async () => {
    const loaders = mockLoaders();
    render(
      <Form onSubmit={() => undefined}>
        <CreateActionForm dimensionOptions={dimensionOptions} loaders={loaders} />
      </Form>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('super-select-factory')).toBeTruthy();
    });
    expect(screen.getByText('关联指标')).toBeTruthy();
    await waitFor(() => {
      expect(loaders.loadFactoryOptions).toHaveBeenCalled();
    });
  });
});
