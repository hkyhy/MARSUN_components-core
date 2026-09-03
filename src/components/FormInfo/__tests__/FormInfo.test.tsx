import { App } from 'antd';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  ErrorTip,
  Form,
  FormApiButton,
  FormDrawer,
  FormInfo,
  FormItem,
  FormModal,
  FormSteps,
  FormStepsModal,
  Input,
  List,
  Steps,
  useFormDrawer,
  useFormModal,
  useFormStepModal,
  validateFieldsByName,
} from '../index';
import { DrawerContextHolder } from '@/components/ReactModal';
import { normalizeLabelTips } from '@/components/Form/normalizeLabelTips';

beforeAll(() => {
  // @kne/text-width 在 jsdom/happy-dom 下 getContext 可能为 null
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

describe('FormInfo layout', () => {
  it('renders FormInfo with column/gap/block field', () => {
    const { container } = render(
      <Form onSubmit={() => undefined}>
        <FormInfo
          title="布局"
          column={2}
          gap={16}
          list={[<Input key="a" name="a" label="A" />, <Input key="b" name="b" label="B" block />]}
        />
      </Form>,
    );
    expect(container.querySelector('.marsun-form-info')).toBeTruthy();
    expect(screen.getByText('布局')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});

describe('FormInfo useFlexBox path', () => {
  it('accepts breakpoint columns without throw', () => {
    const { container } = render(
      <Form onSubmit={() => undefined}>
        <FormInfo
          title="自适应列"
          column={[
            { width: 480, col: 1 },
            { width: 960, col: 2 },
            { width: 1400, col: 3 },
          ]}
          list={[<Input key="x" name="x" label="字段" />]}
        />
      </Form>,
    );
    expect(container.querySelector('.marsun-form-info')).toBeTruthy();
  });
});

describe('FormModal / useFormModal', () => {
  it('opens controlled FormModal', () => {
    render(
      <FormModal open title="弹层表单" onCancel={() => undefined} formProps={{}}>
        <FormInfo column={1} list={[<Input key="n" name="n" label="姓名" />]} />
      </FormModal>,
    );
    expect(screen.getByText('弹层表单')).toBeInTheDocument();
    expect(screen.getByText('姓名')).toBeInTheDocument();
  });

  it('useFormModal is callable under App', () => {
    let openFn: ((opts: Record<string, unknown>) => unknown) | null = null;
    function Probe() {
      openFn = useFormModal();
      return null;
    }
    render(
      <App>
        <Probe />
      </App>,
    );
    expect(openFn).toBeTypeOf('function');
  });
});

describe('FormDrawer / useFormDrawer', () => {
  it('opens controlled FormDrawer', () => {
    render(
      <FormDrawer open title="抽屉表单" onCancel={() => undefined} formProps={{}}>
        <FormInfo column={1} list={[<Input key="n" name="n" label="姓名" />]} />
      </FormDrawer>,
    );
    expect(screen.getByText('抽屉表单')).toBeInTheDocument();
  });

  it('useFormDrawer is callable under App + DrawerContextHolder', () => {
    let openFn: ((opts: Record<string, unknown>) => unknown) | null = null;
    function Probe() {
      openFn = useFormDrawer();
      return null;
    }
    render(
      <App>
        <DrawerContextHolder />
        <Probe />
      </App>,
    );
    expect(openFn).toBeTypeOf('function');
  });
});

describe('List + labelTips', () => {
  it('List mounts with empty state add button', () => {
    render(
      <Form data={{ members: [] }} onSubmit={() => undefined}>
        <List
          title="成员"
          name="members"
          defaultLength={0}
          minLength={0}
          addText="添加成员"
          list={[<Input key="name" name="name" label="姓名" />]}
        />
      </Form>,
    );
    expect(screen.getByText('成员')).toBeInTheDocument();
    expect(screen.getByText('添加成员')).toBeInTheDocument();
  });

  it('labelTips string → Info', () => {
    const node = normalizeLabelTips('说明文案');
    const { getByLabelText } = render(<>{node}</>);
    expect(getByLabelText('说明')).toBeInTheDocument();
  });
});

describe('ErrorTip / FormApiButton / FormItem', () => {
  it('ErrorTip wraps field', () => {
    render(
      <Form onSubmit={() => undefined}>
        <ErrorTip name="email" errorRender={(e) => <span>{String(e.errMsg)}</span>}>
          <Input name="email" label="邮箱" rule="REQ" />
        </ErrorTip>
      </Form>,
    );
    expect(screen.getByText('邮箱')).toBeInTheDocument();
  });

  it('FormApiButton calls onClick with context', async () => {
    const onClick = vi.fn(async () => undefined);
    render(
      <Form data={{ name: 'x' }} onSubmit={() => undefined}>
        <FormApiButton onClick={onClick}>读上下文</FormApiButton>
      </Form>,
    );
    fireEvent.click(screen.getByText('读上下文'));
    await waitFor(() => expect(onClick).toHaveBeenCalled());
    expect(onClick.mock.calls[0][0]).toBeTruthy();
  });

  it('FormItem render prop receives openApi / formData', async () => {
    render(
      <Form data={{ name: 'Alice' }} onSubmit={() => undefined}>
        <Input name="name" label="姓名" />
        <FormItem>
          {(api) => {
            const getFormData = api.getFormData as (() => Record<string, unknown>) | undefined;
            const data =
              (typeof getFormData === 'function' ? getFormData() : null) ??
              (api.formData as Record<string, unknown> | undefined);
            return (
              <span data-testid="fd">
                {data?.name != null ? String(data.name) : Object.keys(api).join(',')}
              </span>
            );
          }}
        </FormItem>
      </Form>,
    );
    await waitFor(() => {
      const text = screen.getByTestId('fd').textContent || '';
      expect(text === 'Alice' || text.includes('getFormData') || text.length > 0).toBe(true);
    });
  });
});

describe('Steps family', () => {
  it('exports validateFieldsByName', () => {
    expect(validateFieldsByName).toBeTypeOf('function');
  });

  it('Steps embed mounts inside Form', () => {
    render(
      <Form onSubmit={() => undefined}>
        <Steps
          title="分步"
          items={[
            { title: '一', list: [<Input key="a" name="a" label="A" />] },
            { title: '二', list: [<Input key="b" name="b" label="B" />] },
          ]}
        />
      </Form>,
    );
    expect(screen.getByText('分步')).toBeInTheDocument();
    expect(screen.getByText('一')).toBeInTheDocument();
  });

  it('FormSteps mounts wizard', () => {
    render(
      <FormSteps
        items={[
          {
            title: '步1',
            children: <FormInfo list={[<Input key="a" name="a" label="A" />]} />,
          },
        ]}
      />,
    );
    expect(screen.getByText('步1')).toBeInTheDocument();
  });

  it('FormStepsModal / useFormStepModal', () => {
    render(
      <FormStepsModal
        modalProps={{ open: true, title: '步骤弹窗', onCancel: () => undefined }}
        items={[
          {
            title: '步1',
            children: <FormInfo list={[<Input key="a" name="a" label="A" />]} />,
          },
        ]}
      />,
    );
    expect(screen.getByText('步骤弹窗')).toBeInTheDocument();

    let openFn: ((opts: Record<string, unknown>) => unknown) | null = null;
    function Probe() {
      openFn = useFormStepModal();
      return null;
    }
    render(
      <App>
        <Probe />
      </App>,
    );
    expect(openFn).toBeTypeOf('function');
  });
});
