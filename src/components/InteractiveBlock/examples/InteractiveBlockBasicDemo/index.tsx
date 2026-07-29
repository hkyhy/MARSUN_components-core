import { SEMANTIC_COLORS } from '../../../Tag';
import InteractiveBlock from '../../';

const InteractiveBlockBasicDemo: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 480 }}>
    <InteractiveBlock
      title="2025-06 强力异常"
      info={[
        { label: '分厂', value: '一厂' },
        { label: '品种', value: 'C32S' },
      ]}
      subtitle="实测 12.8 / 阈值 13.5"
      tags={[{ label: '须确认', color: SEMANTIC_COLORS.WARNING }]}
      actions={[{ key: 'view', label: '查看报告', onClick: () => undefined }]}
      selected
    />
    <InteractiveBlock
      title="tags 在 subtitle 下方"
      subtitle="副标题"
      tagsPlacement="below"
      tags={[{ label: 'L3', color: SEMANTIC_COLORS.ERROR }]}
      description="描述不超过两行展示。"
      actions={[
        { key: 'a', label: '采纳', onClick: () => undefined },
        { key: 'b', label: '驳回', hidden: true },
      ]}
    />
  </div>
);

export default InteractiveBlockBasicDemo;
