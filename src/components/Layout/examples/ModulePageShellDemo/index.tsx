import { Button } from 'antd';
import { useState } from 'react';
import ModulePageShell from '../../ModulePageShell';
import { PageShellProvider } from '../../PageShell';

const ModulePageShellDemo: React.FC = () => {
  const [spinning, setSpinning] = useState(false);

  return (
    <PageShellProvider>
      <ModulePageShell
        title="示例模块"
        toolbar={<Button size="small">工具栏</Button>}
        spinning={spinning}
      >
        <div style={{ padding: 16 }}>
          <Button onClick={() => setSpinning((v) => !v)}>{spinning ? '停止' : '模拟 loading'}</Button>
          <p style={{ marginTop: 12 }}>Filter + 主工作区在 Spin 遮罩内；toolbar 保持可交互。</p>
        </div>
      </ModulePageShell>
    </PageShellProvider>
  );
};

export default ModulePageShellDemo;
