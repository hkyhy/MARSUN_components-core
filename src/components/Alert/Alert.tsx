import classNames from 'classnames';
import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import { CircleAlert, CircleCheck, CircleX, Info, X } from '../Icons';
import styles from './style.module.scss';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface MarsunAlertProps {
  /** 语义类型，默认 info */
  type?: AlertType;
  /** 主文案（必填，建议 ≤2 行） */
  message: ReactNode;
  /** 补充说明；含可操作链接/按钮时再加 */
  description?: ReactNode;
  /** 是否展示左侧图标，默认 true */
  showIcon?: boolean;
  /** 自定义图标，优先级高于默认语义图标 */
  icon?: ReactNode;
  /** 右侧操作区（如按钮） */
  action?: ReactNode;
  /** 是否可关闭 */
  closable?: boolean;
  /** 关闭回调（受控关闭时由业务处理；未受控时内部隐藏） */
  onClose?: () => void;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_ICON: Record<AlertType, ReactNode> = {
  info: <Info size={16} aria-hidden />,
  success: <CircleCheck size={16} aria-hidden />,
  warning: <CircleAlert size={16} aria-hidden />,
  error: <CircleX size={16} aria-hidden />,
};

/**
 * 显性提示条：语义色 + 左侧强调线 + core Icons。
 * 静态说明请用 Info + TooltipInfo，勿滥用本组件作页面常驻说明。
 */
const MarsunAlert: React.FC<MarsunAlertProps> = ({
  type = 'info',
  message,
  description,
  showIcon = true,
  icon,
  action,
  closable = false,
  onClose,
  className,
  style,
}) => {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  const handleClose = () => {
    onClose?.();
    setClosed(true);
  };

  return (
    <div
      role="alert"
      className={classNames(
        'marsun-alert',
        styles['marsun-alert'],
        `marsun-alert--${type}`,
        styles[`marsun-alert--${type}`],
        className,
      )}
      style={style}
    >
      {showIcon ? (
        <span className={classNames('marsun-alert-icon', styles['marsun-alert-icon'])} aria-hidden>
          {icon ?? DEFAULT_ICON[type]}
        </span>
      ) : null}
      <div className={classNames('marsun-alert-body', styles['marsun-alert-body'])}>
        <div className={classNames('marsun-alert-message', styles['marsun-alert-message'])}>
          {message}
        </div>
        {description != null && description !== false ? (
          <div
            className={classNames('marsun-alert-description', styles['marsun-alert-description'])}
          >
            {description}
          </div>
        ) : null}
      </div>
      {action ? (
        <div className={classNames('marsun-alert-action', styles['marsun-alert-action'])}>
          {action}
        </div>
      ) : null}
      {closable ? (
        <button
          type="button"
          className={classNames('marsun-alert-close', styles['marsun-alert-close'])}
          aria-label="关闭"
          onClick={handleClose}
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  );
};

export default MarsunAlert;
