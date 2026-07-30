import { InteractiveBlock } from '@/components/InteractiveBlock';
import { ReportTemplate } from '@/components/AgentHub/Report';
import { Empty } from '@/components/Empty';
import { SEMANTIC_COLORS } from '@/components/Tag';
import styles from './style.module.scss';
import classNames from 'classnames';

/**
 * AgentHub 报告模板 Demo
 */
const ReportTemplateDemo: React.FC = () => (
  <div className={classNames('marsun-report-template-demo', styles['marsun-report-template-demo'])}>
    <ReportTemplate
      badge={<span className={styles['marsun-report-template-demo-badge']}>根因分析</span>}
      title="千米棉结+200%"
      subtitle="八分厂 · MCFS7.4KD(0.9旦)络筒 · 2026-07-22"
      metaItems={[
        { key: 'value', label: '实测值', value: '54.92', tone: 'danger' },
        { key: 'threshold', label: '阈值', value: '12.5' },
        { key: 'baseline', label: '基准均', value: '11.8' },
        { key: 'delta', label: '超出', value: '+42.42', tone: 'warning' },
      ]}
    >
      <section className={styles['marsun-report-template-demo-section']}>
        <h4>根因结论</h4>
        <p>分厂指标在 2026-07 出现异常，需结合时序与工艺排查。</p>
      </section>
      <section className={styles['marsun-report-template-demo-section']}>
        <h4>数据证据 (2)</h4>
        <div className={styles['marsun-report-template-demo-list']}>
          <InteractiveBlock
            surface="inset"
            title="近 90 日时序呈上升趋势"
            subtitle="MES · trend"
            tags={[{ label: 'MES', color: SEMANTIC_COLORS.PROCESSING }]}
            actions={[{ key: 'raw', label: '查看原始数据', onClick: () => undefined }]}
          />
          <InteractiveBlock
            surface="inset"
            title="知识库命中相关工艺条款"
            subtitle="RAGFlow · knowledge"
            tags={[{ label: '知识库', color: SEMANTIC_COLORS.DEFAULT }]}
          />
        </div>
      </section>
      <section className={styles['marsun-report-template-demo-section']}>
        <Empty iconType="simple" description="暂无排查方向或改善建议" />
      </section>
    </ReportTemplate>
  </div>
);

export default ReportTemplateDemo;
