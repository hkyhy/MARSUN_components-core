import { ChevronLeft } from '@/components/Icons';
import { Button, Modal, Steps } from 'antd';
import React, { useCallback, useMemo } from 'react';
import type { StepModalProps } from '../StepModalTypes';
import styles from './style.module.scss';
import classNames from 'classnames';

/** 解析可能是函数的 content / footer */
const resolve = (val: React.ReactNode | (() => React.ReactNode) | undefined) => {
  if (val === undefined) return undefined;
  return typeof val === 'function' ? val() : val;
};

/**
 * 步骤式弹窗
 *
 * 将多步骤流程封装在同一个 Modal 中，自动管理步骤导航、标题切换和底部按钮。
 *
 * 用法：
 * ```tsx
 * const [current, setCurrent] = useState('select');
 * <StepModal
 *   open={open}
 *   current={current}
 *   onCancel={onCancel}
 *   steps={[
 *     { key: 'select', title: '选择文件', content: <SelectStep /> },
 *     { key: 'uploading', title: '上传文件', content: <UploadingStep /> },
 *     { key: 'result', title: '上传结果', content: <ResultStep /> },
 *   ]}
 *   onStepChange={setCurrent}
 * />
 * ```
 */
const StepModal: React.FC<StepModalProps> = ({
  title,
  steps,
  current,
  open,
  onCancel,
  width = 600,
  showSteps = true,
  maskClosable = false,
  className,
  onStepChange,
}) => {
  const currentIndex = useMemo(() => steps.findIndex((s) => s.key === current), [steps, current]);
  const currentStep = steps[currentIndex];

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      onStepChange?.(steps[currentIndex - 1]!.key);
    }
  }, [currentIndex, steps, onStepChange]);

  const goNext = useCallback(async () => {
    if (!currentStep?.beforeEnter) {
      if (currentIndex < steps.length - 1) {
        onStepChange?.(steps[currentIndex + 1]!.key);
      }
      return;
    }
    const canEnter = await currentStep.beforeEnter();
    if (canEnter && currentIndex < steps.length - 1) {
      onStepChange?.(steps[currentIndex + 1]!.key);
    }
  }, [currentStep, currentIndex, steps, onStepChange]);

  // 自动从标题推导
  const modalTitle = title ?? currentStep?.title ?? '';

  // 底部按钮：优先使用步骤自定义 footer，否则自动渲染"取消/上一步/下一步"
  const renderFooter = () => {
    if (currentStep?.footer !== undefined) return resolve(currentStep.footer);

    return (
      <div className={classNames('step-modal-root', styles['step-modal-root'])}>
        {currentIndex > 0 && currentStep?.allowBack !== false && (
          <Button icon={<ChevronLeft />} onClick={goBack}>
            上一步
          </Button>
        )}
        <div className={classNames('step-modal-container', styles['step-modal-container'])} />
        <Button onClick={onCancel}>取消</Button>
        {currentIndex < steps.length - 1 && (
          <Button type="primary" onClick={goNext}>
            下一步
          </Button>
        )}
      </div>
    );
  };

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={onCancel}
      width={width}
      footer={renderFooter()}
      maskClosable={maskClosable}
      className={className}
    >
      {showSteps && steps.length > 1 && (
        <Steps
          current={currentIndex}
          size="small"
          className={classNames('step-modal-wrapper', styles['step-modal-wrapper'])}
          items={steps.map((s) => ({ title: s.title, description: s.description }))}
        />
      )}
      {resolve(currentStep?.content)}
    </Modal>
  );
};

export default StepModal;
