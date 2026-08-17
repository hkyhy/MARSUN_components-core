import type { LucideIcon, LucideProps } from 'lucide-react';
import './icons.global.css';
import React from 'react';

export type IconProps = LucideProps & {
  spin?: boolean;
  rotate?: number;
};

export const createIcon = (Icon: LucideIcon, options?: { filled?: boolean }) => {
  const WrappedIcon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ spin, rotate, className, style, strokeWidth, fill, color, ...props }, ref) => (
      <Icon
        ref={ref}
        size="1em"
        className={
          ['marsun-icon', className, spin ? 'animate-spin' : ''].filter(Boolean).join(' ') ||
          undefined
        }
        style={{
          display: 'inline-block',
          verticalAlign: '-0.125em',
          ...(color ? {} : { color: 'inherit' }),
          ...(rotate ? { transform: `rotate(${rotate}deg)` } : null),
          ...style,
        }}
        color={color ?? 'currentColor'}
        strokeWidth={strokeWidth ?? (options?.filled ? 0 : 2)}
        fill={fill ?? (options?.filled ? 'currentColor' : 'none')}
        aria-hidden={props['aria-label'] ? undefined : true}
        {...props}
      />
    ),
  );

  WrappedIcon.displayName = Icon.displayName ?? Icon.name;
  return WrappedIcon;
};
