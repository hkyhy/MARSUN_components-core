// @ts-nocheck
/**
 * 本地 intl stub：不引入 `@kne/react-intl`。
 * useIntl 返回中文消息；createWithIntlProvider 为透传 HOC。
 */
import React from 'react';
import zhCN from './locale/zh-CN';

const MESSAGES = zhCN;

export function useIntl() {
  return {
    formatMessage: ({ id, defaultMessage } = {}) =>
      (id && MESSAGES[id]) || defaultMessage || id || '',
  };
}

export function FormattedMessage({ id, defaultMessage, children }) {
  const text = (id && MESSAGES[id]) || defaultMessage || id || '';
  if (typeof children === 'function') {
    return children(text);
  }
  return text;
}

/**
 * 兼容上游 createWithIntlProvider：返回透传 HOC（默认中文，无 Provider）。
 */
export function createWithIntlProvider() {
  return function withLocale(Component) {
    function WithLocale(props) {
      return React.createElement(Component, props);
    }
    WithLocale.displayName = `WithLocale(${Component.displayName || Component.name || 'Component'})`;
    return WithLocale;
  };
}
