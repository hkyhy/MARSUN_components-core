import { LlmFormattedText } from '@/components';
import classNames from 'classnames';
import React from 'react';
import styles from './style.module.scss';

const STRUCTURED_TEXT = `设备温度持续偏高，已超过阈值 15 分钟。

可能原因：
1. 冷却风扇转速不足
2. 散热片积尘严重
3. 环境温度过高

改进建议：
1. 检查风扇运行状态并清理积尘
2. 确认机房空调设定温度
3. 必要时安排停机检修`;

const PLAIN_TEXT = '当前数据质量良好，未发现明显异常。';

/** LlmFormattedText 结构化文本展示示例 */
const LlmFormattedTextBasicDemo: React.FC = () => (
  <div className={classNames('llm-formatted-text-basic-demo', styles['llm-formatted-text-basic-demo'])}>
    <section className={styles['llm-formatted-text-basic-demo-section']}>
      <h4 className={styles['llm-formatted-text-basic-demo-title']}>结构化解析</h4>
      <LlmFormattedText text={STRUCTURED_TEXT} />
    </section>
    <section className={styles['llm-formatted-text-basic-demo-section']}>
      <h4 className={styles['llm-formatted-text-basic-demo-title']}>纯文本</h4>
      <LlmFormattedText text={PLAIN_TEXT} />
    </section>
    <section className={styles['llm-formatted-text-basic-demo-section']}>
      <h4 className={styles['llm-formatted-text-basic-demo-title']}>加载中</h4>
      <LlmFormattedText text="正在分析..." loading />
    </section>
  </div>
);

export default LlmFormattedTextBasicDemo;
