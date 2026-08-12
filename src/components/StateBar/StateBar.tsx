import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import classNames from 'classnames';
import type { CSSProperties, ReactNode } from 'react';
import { Info } from '../Icons';
import type { DescriptionItem } from '../Descriptions/CommonDescriptions';
import { TooltipInfo } from '../TooltipInfo';
import styles from './style.module.scss';

export type StateBarType = 'tab' | 'radio' | 'step';

export type StateBarOption = {
  key: string;
  /** 选项卡标题（优先于 label） */
  tab?: ReactNode;
  label?: ReactNode;
  /** 标题旁 Info + TooltipInfo（对齐 Modal/InteractiveBlock）；为空不展示 icon */
  info?: DescriptionItem[];
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

/** 渲染 Tab 标题：文字 + 可选 Info icon（hover 展示 TooltipInfo 详情） */
function renderTabLabel(label: ReactNode, info?: DescriptionItem[]): ReactNode {
  if (!info || info.length === 0) return label;
  return (
    <span className={classNames('marsun-state-bar-tab-label', styles['state-bar-tab-label'])}>
      {label}
      <TooltipInfo
        content={info}
        placement="topLeft"
        minWidth={220}
        maxWidth={360}
        overlayClassName="marsun-state-bar-info-tooltip"
      >
        <span className={classNames('marsun-state-bar-info', styles['state-bar-info'])}>
          <Info size={14} aria-hidden />
        </span>
      </TooltipInfo>
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
      items={stateOption.map(({ tab, label, info, key, ...rest }) => ({
        key,
        label: renderTabLabel(tab ?? label, info),
        ...rest,
      }))}
    />
  );
};

export default StateBar;
