// @ts-nocheck
// Ported from https://github.com/kne-union/react-modal/blob/master/src/withLocale.js
// 改写：使用本地 intlStub，不依赖 @kne/react-intl
import { createWithIntlProvider } from './intlStub';
import zhCN from './locale/zh-CN';
import enUS from './locale/en-US';

const withLocale = createWithIntlProvider({
  defaultLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
  namespace: 'react-modal',
});

export default withLocale;
