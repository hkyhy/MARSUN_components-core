import { Tabs, Tooltip, Button } from 'antd';
import type { TabsProps, ButtonProps } from 'antd';
import classNames from 'classnames';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { Info, ICON_REGISTRY, type IconName } from '../Icons';
import type { DescriptionItem } from '../Descriptions/CommonDescriptions';
import { TooltipInfo } from '../TooltipInfo';
import styles from './style.module.scss';

export type StateBarType = 'tab' | 'radio' | 'step';

/** Tab 项旁 / 整体右侧操作 */
export type StateBarActionItem = {
  /**
   * 展示形态：
   * - `icon`：仅图标（默认，适合 Tab 旁轻操作）
   * - `button`：antd Button（适合整体右侧主操作，如「新建模板」）
   */
  variant?: 'icon' | 'button';
  /** Icons 注册表名；variant=icon 必填；button 时可作前缀图标 */
  iconType?: IconName;
  /** 文案：icon 时作 Tooltip；button 时作按钮文字 */
  label?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  className?: string;
  /** 图标尺寸，默认 14 */
  size?: number;
  /** variant=button 时的 antd type，默认 primary */
  buttonType?: ButtonProps['type'];
};

export type StateBarOption = {
  key: string;
  /** 选项卡标题（优先于 label） */
  tab?: ReactNode;
  label?: ReactNode;
  /** 标题旁 Info + TooltipInfo（对齐 Modal/InteractiveBlock）；为空不展示 */
  info?: DescriptionItem[];
  /** 标题旁额外操作图标（可与 info 并存）；仅同组切片 Tab 使用 */
  actions?: StateBarActionItem[];
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

export type StateBarProps = Omit<TabsProps, 'items' | 'type'> & {
  /** 状态项列表 */
  stateOption?: StateBarOption[];
  /** 展示样式 */
  type?: StateBarType;
  /** 底部线延展至容器全宽 */
  isInner?: boolean;
  className?: string;
  /**
   * 整体右侧操作（tabBarExtraContent）。
   * 跨 Tab 的页面级操作放这里；仅当各 Tab 为同组切片（如模板1/2/3）时才用 option.actions。
   */
  actions?: StateBarActionItem[];
};

function renderActionItem(action: StateBarActionItem, key: string): ReactNode {
  const variant = action.variant ?? 'icon';

  if (variant === 'button') {
    const Icon = action.iconType ? ICON_REGISTRY[action.iconType] : null;
    return (
      <Button
        key={key}
        type={action.buttonType ?? 'primary'}
        size="small"
        disabled={action.disabled}
        className={classNames(
          'marsun-state-bar-action-btn',
          styles['state-bar-action-btn'],
          action.className,
        )}
        icon={Icon ? <Icon size={action.size ?? 14} aria-hidden /> : undefined}
        onClick={(e) => {
          e.stopPropagation();
          if (action.disabled) return;
          action.onClick?.(e);
        }}
      >
        {action.label || '操作'}
      </Button>
    );
  }

  const Icon = action.iconType ? ICON_REGISTRY[action.iconType] : null;
  if (!Icon) return null;

  const node = (
    <span
      key={key}
      role={action.onClick ? 'button' : undefined}
      tabIndex={action.onClick && !action.disabled ? 0 : undefined}
      className={classNames(
        'marsun-state-bar-action',
        styles['state-bar-action'],
        action.disabled && 'marsun-state-bar-action-disabled',
        action.disabled && styles['state-bar-action-disabled'],
        action.className,
      )}
      aria-label={action.label || action.iconType}
      aria-disabled={action.disabled || undefined}
      onClick={(e) => {
        e.stopPropagation();
        if (action.disabled) return;
        action.onClick?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        e.stopPropagation();
        if (action.disabled) return;
        action.onClick?.(e as unknown as MouseEvent<HTMLElement>);
      }}
    >
      <Icon size={action.size ?? 14} aria-hidden />
    </span>
  );

  if (!action.label) return node;
  return (
    <Tooltip key={key} title={action.label}>
      {node}
    </Tooltip>
  );
}

/** 渲染 Tab 标题：文字 + 可选 Info + actions */
function renderTabLabel(
  label: ReactNode,
  info?: DescriptionItem[],
  actions?: StateBarActionItem[],
): ReactNode {
  const hasInfo = Boolean(info && info.length > 0);
  const hasActions = Boolean(actions && actions.length > 0);
  if (!hasInfo && !hasActions) return label;

  return (
    <span className={classNames('marsun-state-bar-tab-label', styles['state-bar-tab-label'])}>
      {label}
      {hasInfo ? (
        <TooltipInfo
          content={info!}
          placement="topLeft"
          minWidth={220}
          maxWidth={360}
          overlayClassName="marsun-state-bar-info-tooltip"
        >
          <span
            className={classNames('marsun-state-bar-info', styles['state-bar-info'])}
            onClick={(e) => e.stopPropagation()}
          >
            <Info size={14} aria-hidden />
          </span>
        </TooltipInfo>
      ) : null}
      {hasActions
        ? actions!.map((action, i) => renderActionItem(action, `${action.iconType || 'act'}-${i}`))
        : null}
    </span>
  );
}

/**
 * 基于 antd Tabs 的状态栏（对齐 kne-union StateBar）。
 * 无 children 时仅作切换条（隐藏 content-holder）；有 children 时展示面板。
 */
const StateBar: React.FC<StateBarProps> = ({
  className,
  type = 'tab',
  stateOption = [],
  isInner,
  style,
  actions,
  tabBarExtraContent,
  ...props
}) => {
  const hasChildren = stateOption.some((item) => item.children != null);

  const extraActions =
    actions && actions.length > 0 ? (
      <span
        className={classNames('marsun-state-bar-extra-actions', styles['state-bar-extra-actions'])}
      >
        {actions.map((action, i) =>
          renderActionItem(action, `extra-${action.iconType || action.variant || 'act'}-${i}`),
        )}
      </span>
    ) : null;

  const mergedExtra: TabsProps['tabBarExtraContent'] =
    extraActions && tabBarExtraContent != null ? (
      <span className={styles['state-bar-extra-wrap']}>
        {extraActions}
        {tabBarExtraContent as ReactNode}
      </span>
    ) : (
      (extraActions ?? tabBarExtraContent)
    );

  return (
    <Tabs
      {...props}
      tabBarExtraContent={mergedExtra}
      data-testid="components-core-state-bar"
      animated={false}
      className={classNames(
        'marsun-state-bar',
        styles['state-bar'],
        styles[`tab-${type}-control`],
        isInner && styles['inner-state-bar'],
        hasChildren && styles['has-children'],
        className,
      )}
      style={
        {
          ['--total-count' as string]: stateOption.length,
          ...style,
        } as CSSProperties
      }
      items={stateOption.map(({ tab, label, info, actions: tabActions, key, ...rest }) => ({
        key,
        label: renderTabLabel(tab ?? label, info, tabActions),
        ...rest,
      }))}
    />
  );
};

export default StateBar;
