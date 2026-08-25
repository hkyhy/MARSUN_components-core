import { Tabs, Tooltip } from 'antd';
import type { TabsProps } from 'antd';
import classNames from 'classnames';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { Info, ICON_REGISTRY, type IconName } from '../Icons';
import type { DescriptionItem } from '../Descriptions/CommonDescriptions';
import { TooltipInfo } from '../TooltipInfo';
import styles from './style.module.scss';

export type StateBarType = 'tab' | 'radio' | 'step';

/** Tab 项旁操作（icon + 可选文案提示 + 点击） */
export type StateBarActionItem = {
  /** Icons 注册表名，如 `Info` / `Plus` / `Pencil` */
  iconType: IconName;
  /** Tooltip 文案；缺省不包 Tooltip */
  label?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  className?: string;
  /** 图标尺寸，默认 14 */
  size?: number;
};

export type StateBarOption = {
  key: string;
  /** 选项卡标题（优先于 label） */
  tab?: ReactNode;
  label?: ReactNode;
  /** 标题旁 Info + TooltipInfo（对齐 Modal/InteractiveBlock）；为空不展示 */
  info?: DescriptionItem[];
  /** 标题旁额外操作图标（可与 info 并存） */
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
};

function renderActionItem(action: StateBarActionItem, key: string): ReactNode {
  const Icon = ICON_REGISTRY[action.iconType];
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
        ? actions!.map((action, i) => renderActionItem(action, `${action.iconType}-${i}`))
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
  ...props
}) => {
  const hasChildren = stateOption.some((item) => item.children != null);

  return (
    <Tabs
      {...props}
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
      items={stateOption.map(({ tab, label, info, actions, key, ...rest }) => ({
        key,
        label: renderTabLabel(tab ?? label, info, actions),
        ...rest,
      }))}
    />
  );
};

export default StateBar;
