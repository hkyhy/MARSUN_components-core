import type React from 'react';

/** 步骤项定义 */
export interface StepItem {
  /** 步骤唯一 key */
  key: string;
  /** 步骤标题 */
  title: string;
  /** 步骤描述（可选，显示在 Steps 下方） */
  description?: string;
  /** 步骤内容，支持直接 JSX 或函数返回 JSX（延迟求值） */
  content: React.ReactNode | (() => React.ReactNode);
  /** 底部按钮区域，不传则使用默认的"取消/下一步"逻辑，支持函数延迟求值 */
  footer?: React.ReactNode | (() => React.ReactNode);
  /** 是否允许返回上一步 */
  allowBack?: boolean;
  /** 进入该步骤前的校验，返回 true 允许进入，false 阻止 */
  beforeEnter?: () => boolean | Promise<boolean>;
}

export interface StepModalProps {
  /** 弹窗标题（覆盖步骤标题） */
  title?: string;
  /** 步骤列表 */
  steps: StepItem[];
  /** 当前步骤 key */
  current: string;
  /** 弹窗是否打开 */
  open: boolean;
  /** 取消/关闭回调 */
  onCancel: () => void;
  /** 弹窗宽度 */
  width?: number;
  /** 是否显示 Steps 导航条 */
  showSteps?: boolean;
  /** 是否允许点击遮罩关闭 */
  maskClosable?: boolean;
  /** 自定义 className */
  className?: string;
  /** 切换步骤回调 */
  onStepChange?: (key: string) => void;
}
