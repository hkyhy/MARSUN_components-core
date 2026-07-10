import { Empty as AntEmpty } from 'antd';
import type { EmptyProps } from 'antd';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import styles from './style.module.scss';

export type EmptyIconType = 'default' | 'simple';

export interface MarsunEmptyProps extends Omit<EmptyProps, 'image' | 'description'> {
  /** 是否展示图标，默认 true */
  showIcon?: boolean;
  /** 预设图标：default=antd 默认图，simple=PRESENTED_IMAGE_SIMPLE */
  iconType?: EmptyIconType;
  /** 自定义图标节点，优先级高于 iconType */
  icon?: ReactNode;
  /** 描述文案，不传则不渲染 description */
  description?: ReactNode;
}

function resolveImage({
  showIcon,
  iconType,
  icon,
}: Pick<MarsunEmptyProps, 'showIcon' | 'iconType' | 'icon'>): EmptyProps['image'] {
  if (showIcon === false) return false;
  if (icon) return icon;
  if (iconType === 'simple') return AntEmpty.PRESENTED_IMAGE_SIMPLE;
  return undefined;
}

/** 基于 antd Empty 的空态展示，统一 Icon / description 可选语义 */
const MarsunEmpty: React.FC<MarsunEmptyProps> = ({
  showIcon = true,
  iconType = 'default',
  icon,
  description,
  className,
  ...rest
}) => (
  <AntEmpty
    className={classNames('marsun-empty', styles['marsun-empty'], className)}
    image={resolveImage({ showIcon, iconType, icon })}
    description={description !== undefined ? description : false}
    {...rest}
  />
);

export default MarsunEmpty;
