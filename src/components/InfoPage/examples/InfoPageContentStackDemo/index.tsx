import { InfoPage, InfoPageContent } from '@/components';
import classNames from 'classnames';
import styles from './style.module.scss';

/**
 * Content layout=stack：上 label / 下 value 平铺指标（对齐原 energy-detail-kv）
 */
const InfoPageContentStackDemo: React.FC = () => (
  <div
    className={classNames('info-page-content-stack-demo', styles['info-page-content-stack-demo'])}
  >
    <InfoPage gap={16}>
      <InfoPage.Part title="保养超期统计">
        <InfoPageContent
          layout="stack"
          gutter={[16, 10]}
          list={[
            { label: '窗内超期次数', content: '0' },
            { label: '最近保养类型', content: '保养' },
            { label: '上次保养日', content: '2026-09-12' },
            { label: '当前周期（天）', content: '30' },
            { label: '当前超期（天）', content: '—' },
          ]}
        />
      </InfoPage.Part>
      <InfoPage.Part title="生产指标">
        <InfoPageContent
          layout="stack"
          gutter={[16, 10]}
          list={[
            { label: '断头率', content: '5.9524' },
            { label: '当日停台时长占比', content: '0.69%' },
            { label: '产量（吨）', content: '0.1562' },
          ]}
        />
      </InfoPage.Part>
    </InfoPage>
  </div>
);

export default InfoPageContentStackDemo;
