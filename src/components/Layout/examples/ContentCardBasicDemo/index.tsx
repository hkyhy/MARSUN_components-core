import ContentCard from '../../ContentCard';

const ContentCardBasicDemo: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
    <ContentCard>
      <p style={{ margin: 0 }}>默认卡片：带内边距与背景块。</p>
    </ContentCard>
    <ContentCard flat noPadding>
      <p style={{ margin: 0, padding: 16 }}>flat + noPadding：模块 workarea 扁平容器。</p>
    </ContentCard>
  </div>
);

export default ContentCardBasicDemo;
