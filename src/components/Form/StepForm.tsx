import type { StepItem, StepModalProps } from '@/components/Modal';
import { StepModal } from '@/components/Modal';
import { Form } from 'antd';
import React, { useCallback, useMemo } from 'react';

export interface StepFormProps extends Omit<StepModalProps, 'steps'> {
  /** 步骤列表 */
  steps: StepFormItem[];
  /** antd Form 实例 */
  form: ReturnType<typeof Form.useForm>[0];
}

/** 扩展 StepItem，增加表单校验步骤支持 */
export interface StepFormItem extends Omit<StepItem, 'beforeEnter'> {
  /** 进入下一步前校验的表单字段列表，不传则不做表单校验 */
  validateFields?: string[];
  /** 自定义校验（在 validateFields 之后执行） */
  beforeEnter?: (values: Record<string, unknown>) => boolean | Promise<boolean>;
}

/**
 * 步骤式表单弹窗
 *
 * 在 StepModal 基础上集成 Form 校验能力，
 * 每个步骤可声明需要校验的字段，点击"下一步"时自动 validateFields。
 *
 * 用法：
 * ```tsx
 * const [form] = Form.useForm();
 * const [current, setCurrent] = useState('basic');
 *
 * <StepForm
 *   form={form}
 *   open={open}
 *   current={current}
 *   onCancel={onCancel}
 *   onStepChange={setCurrent}
 *   steps={[
 *     { key: 'basic', title: '基本信息', validateFields: ['name'], content: <BasicStep /> },
 *     { key: 'detail', title: '详细信息', content: <DetailStep /> },
 *   ]}
 * />
 * ```
 */
const StepForm: React.FC<StepFormProps> = ({ form, steps, onStepChange, ...rest }) => {
  const enhancedSteps: StepItem[] = useMemo(
    () =>
      steps.map((step) => {
        const { validateFields, beforeEnter, ...restStep } = step;
        return {
          ...restStep,
          beforeEnter: async () => {
            // 有 validateFields 配置时先做表单校验
            if (validateFields && validateFields.length > 0) {
              try {
                const values = await form.validateFields(validateFields);
                // 校验通过后再执行自定义校验
                if (beforeEnter) return beforeEnter(values as Record<string, unknown>);
                return true;
              } catch {
                return false;
              }
            }
            // 无字段校验，直接执行自定义校验
            if (beforeEnter) return beforeEnter({});
            return true;
          },
        };
      }),
    [form, steps],
  );

  const handleStepChange = useCallback(
    (key: string) => {
      onStepChange?.(key);
    },
    [onStepChange],
  );

  return <StepModal {...rest} steps={enhancedSteps} onStepChange={handleStepChange} />;
};

export default StepForm;
