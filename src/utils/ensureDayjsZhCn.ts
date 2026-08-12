/**
 * 副作用模块：在与 antd DatePicker / @rc-component/picker 相同的 dayjs 上注册 zh-cn。
 * 月名面板走 localeData().monthsShort()；仅 ConfigProvider zh_CN 不够。
 * 须以 `import '@/utils/ensureDayjsZhCn'` 引入（勿 tree-shake）；见 package.json sideEffects。
 */
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');
