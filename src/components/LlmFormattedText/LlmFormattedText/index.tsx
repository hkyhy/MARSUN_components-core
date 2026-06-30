import classNames from 'classnames';
import React from 'react';
import { parseLlmText } from '../parseLlmText';
import styles from './style.module.scss';

const SECTION_ICONS: Record<string, string> = {
  causes: '◆',
  suggestions: '✓',
  summary: '●',
};

export interface LlmFormattedTextProps {
  text?: string;
  loading?: boolean;
  className?: string;
}

const LlmFormattedText: React.FC<LlmFormattedTextProps> = ({
  text = '',
  loading: loadingProp,
  className,
}) => {
  const parsed = parseLlmText(text);
  const loading = loadingProp || parsed.loading;

  if (loading) {
    return (
      <div className={classNames('llm-formatted-text', styles['llm-formatted-text'], styles['is-loading'], className)}>
        <span className={styles['ft-spinner']} aria-hidden />
        <span>{text || '正在生成...'}</span>
      </div>
    );
  }

  const hasStructure = parsed.summary || parsed.sections.length > 0;
  if (!hasStructure) {
    return (
      <div className={classNames('llm-formatted-text', styles['llm-formatted-text'], className)}>
        <p className={styles['ft-paragraph']}>{text}</p>
      </div>
    );
  }

  return (
    <div className={classNames('llm-formatted-text', styles['llm-formatted-text'], className)}>
      {parsed.summary ? <p className={styles['ft-summary']}>{parsed.summary}</p> : null}
      {parsed.sections.map((sec: { type: string; title: string; items: string[] }) => (
        <section
          key={`${sec.type}-${sec.title}`}
          className={classNames(styles['ft-section'], styles[`ft-${sec.type}`])}
        >
          <h4 className={styles['ft-section-title']}>
            <span className={styles['ft-section-icon']} aria-hidden>
              {SECTION_ICONS[sec.type] || '•'}
            </span>
            {sec.title}
          </h4>
          {sec.items.length > 1 ? (
            <ul className={styles['ft-list']}>
              {sec.items.map((item: string, i: number) => (
                <li key={i}>
                  <span className={styles['ft-num']}>{i + 1}</span>
                  <span className={styles['ft-item-text']}>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles['ft-paragraph']}>{sec.items[0]}</p>
          )}
        </section>
      ))}
    </div>
  );
};

export default LlmFormattedText;
