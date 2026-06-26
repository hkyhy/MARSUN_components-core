import { Tag } from 'antd';
import React from 'react';

/**
 * 语义化颜色常量
 * 统一管理所有 Tag 的颜色，避免各处硬编码不一致
 *
 * 主题色（primary/success/info/warning/danger）使用 CSS 变量，跟随系统主题色动态变化
 * 固定色（default/processing/other/volcano/cyan/gold/lime）集中管理，不随主题变化
 */
export const SEMANTIC_COLORS = {
  /** 主题色（跟随系统主题色动态变化） */
  PRIMARY: 'primary',
  /** 默认/中性 */
  DEFAULT: 'default',
  /** 信息/提示 */
  INFO: 'info',
  /** 进行中/处理中 */
  PROCESSING: 'processing',
  /** 成功/已完成/已通过 */
  SUCCESS: 'success',
  /** 警告/待处理 */
  WARNING: 'warning',
  /** 危险/紧急/已驳回 */
  DANGER: 'danger',
  /** 其他/特殊 */
  OTHER: 'other',
  /** 火山/待领导审批 */
  VOLCANO: 'volcano',
  /** 青色/辅助 */
  CYAN: 'cyan',
  /** 金色/高优先级 */
  GOLD: 'gold',
  /** 石灰/低优先级 */
  LIME: 'lime',
} as const;

export type SemanticColor = (typeof SEMANTIC_COLORS)[keyof typeof SEMANTIC_COLORS];

/**
 * 主题色映射：使用 CSS 变量，跟随系统主题色动态变化
 * 文字色 = --{prefix}-color，背景色 = --{prefix}-color-bg（6% 透明度）
 */
const THEME_COLOR_MAP: Record<string, { text: string; bg: string }> = {
  primary: { text: 'var(--primary-color)', bg: 'var(--primary-color-bg)' },
  success: { text: 'var(--success-color)', bg: 'var(--success-color-bg)' },
  info: { text: 'var(--info-color)', bg: 'var(--info-color-bg)' },
  warning: { text: 'var(--warning-color)', bg: 'var(--warning-color-bg)' },
  danger: { text: 'var(--error-color)', bg: 'var(--error-color-bg)' },
};

/**
 * 固定色映射：不随主题变化，集中管理避免硬编码
 * 仅用于非主题色场景（processing/other/volcano/cyan/gold/lime 等）
 */
const FIXED_COLOR_MAP: Record<string, string> = {
  default: '#666666',
  processing: '#F09700',
  other: '#6740C3',
  volcano: '#fa541c',
  cyan: '#13c2c2',
  gold: '#faad14',
  lime: '#a0d911',
};

/** 将 hex 颜色转换为 rgba */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** 解析颜色键为 hex 值（仅用于固定色） */
function resolveFixedColor(color: string): string {
  if (FIXED_COLOR_MAP[color]) return FIXED_COLOR_MAP[color];
  if (color.startsWith('#')) return color;
  return color;
}

interface SemanticTagProps {
  /** 标签文本 */
  children: React.ReactNode;
  /** 语义化颜色，优先使用 SEMANTIC_COLORS 中的值 */
  color?: SemanticColor | string;
  /** antd Tag 其余属性 */
  [key: string]: unknown;
}

/** 公共样式 */
const TAG_BASE_STYLE: React.CSSProperties = {
  border: 'none',
  height: 24,
  lineHeight: '22px',
  padding: '0 8px',
};

/**
 * 统一 Tag 组件
 * - 主题色（primary/success/info/warning/danger）使用 CSS 变量，跟随系统主题色动态变化
 * - 固定色集中管理，避免硬编码
 * - 文字颜色 = 语义色，背景色 = 语义色 6% 透明度
 * - 统一尺寸：height 24px, line-height 24px, padding 0 8px
 */
const SemanticTag: React.FC<SemanticTagProps> = ({
  children,
  color = SEMANTIC_COLORS.DEFAULT,
  ...rest
}) => {
  // 优先匹配主题色（CSS 变量）
  const themeColor = THEME_COLOR_MAP[color];
  if (themeColor) {
    return (
      <Tag
        style={{
          ...TAG_BASE_STYLE,
          color: themeColor.text,
          backgroundColor: themeColor.bg,
        }}
        {...rest}
      >
        {children}
      </Tag>
    );
  }

  // 固定色 / 自定义 hex
  const hex = resolveFixedColor(color);
  return (
    <Tag
      style={{
        ...TAG_BASE_STYLE,
        color: hex,
        backgroundColor: hexToRgba(hex, 0.06),
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default SemanticTag;
