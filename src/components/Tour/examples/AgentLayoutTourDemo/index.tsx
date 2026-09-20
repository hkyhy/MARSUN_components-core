import { AppTour, getTargetByTourId } from '@/components/Tour';
import type { AppTourStep } from '@/components/Tour/AppTour';
import { Button, Card, Segmented, Space } from 'antd';
import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import styles from './style.module.scss';

type DemoPermSet = 'all' | 'alertsOnly' | 'configOnly';

type DemoStepDef = {
  id: string;
  title: string;
  description: string;
  tourId?: string;
  placement?: AppTourStep['placement'];
  /** Demo-only codes — not business IAM. */
  requireAll?: string[];
};

const STORAGE_KEY = 'marsun-core-agent-layout-tour:v1';

const ALL_STEPS: DemoStepDef[] = [
  {
    id: 'welcome',
    title: '欢迎',
    description: 'Agent 壳层导览示例：步骤按权限码集合过滤，禁止按角色名分支。',
  },
  {
    id: 'sider-alerts',
    title: '侧栏 · 预警',
    description: '有 menu:alerts 码时可见本步。',
    tourId: 'demo-sider-alerts',
    placement: 'right',
    requireAll: ['menu:alerts'],
  },
  {
    id: 'sider-config',
    title: '侧栏 · 配置',
    description: '有 menu:config 码时可见本步。',
    tourId: 'demo-sider-config',
    placement: 'right',
    requireAll: ['menu:config'],
  },
  {
    id: 'header-help',
    title: '顶栏导览入口',
    description: '系统导览挂在 headerActions，可随时重开。',
    tourId: 'demo-header-tour',
    placement: 'bottom',
  },
  {
    id: 'main',
    title: '主内容区',
    description: '业务主路径在此；多路由编排属业务仓，不在 core。',
    tourId: 'demo-main',
    placement: 'top',
  },
];

const PERM_SETS: Record<DemoPermSet, string[]> = {
  all: ['menu:alerts', 'menu:config'],
  alertsOnly: ['menu:alerts'],
  configOnly: ['menu:config'],
};

function toAppSteps(defs: DemoStepDef[], codes: string[]): AppTourStep[] {
  const set = new Set(codes);
  return defs
    .filter((s) => !s.requireAll?.length || s.requireAll.every((c) => set.has(c)))
    .map((s) => {
      const step: AppTourStep = {
        title: s.title,
        description: s.description,
        placement: s.placement,
      };
      if (s.tourId) {
        const id = s.tourId;
        step.target = () => getTargetByTourId(id) as HTMLElement;
      }
      return step;
    });
}

/**
 * Agent 壳层 Tour 示例：data-tour 锚点 + 权限码集合过滤 + 版本化 storageKey 重置。
 * 业务权限码勿写入 core；本 demo 使用虚构 menu:* 码。
 */
const AgentLayoutTourDemo: React.FC = () => {
  const [permSet, setPermSet] = useState<DemoPermSet>('all');
  const [tourKey, setTourKey] = useState(0);

  const codes = PERM_SETS[permSet];
  const steps = useMemo(() => toAppSteps(ALL_STEPS, codes), [codes]);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTourKey((k) => k + 1);
  };

  return (
    <div className={classNames('agent-layout-tour-demo', styles.root)}>
      <Space wrap style={{ marginBottom: 12 }}>
        <span>模拟权限码集合：</span>
        <Segmented
          value={permSet}
          onChange={(v) => setPermSet(v as DemoPermSet)}
          options={[
            { label: 'alerts+config', value: 'all' },
            { label: '仅 alerts', value: 'alertsOnly' },
            { label: '仅 config', value: 'configOnly' },
          ]}
        />
        <Button size="small" onClick={handleReset}>
          重置导览记录
        </Button>
      </Space>

      <div className={styles.shell}>
        <aside className={styles.sider}>
          <div data-tour="demo-sider-alerts" className={styles.siderItem}>
            质量预警
          </div>
          <div data-tour="demo-sider-config" className={styles.siderItem}>
            预警规则包
          </div>
        </aside>
        <div className={styles.mainCol}>
          <div className={styles.header}>
            <span>Agent 示例壳</span>
            <span data-tour="demo-header-tour">
              <AppTour
                key={`${tourKey}-${permSet}`}
                steps={steps}
                storageKey={STORAGE_KEY}
                autoOpen={false}
              />
            </span>
          </div>
          <Card size="small" title="主内容">
            <div data-tour="demo-main">
              <p>
                点击「?」开导览。切换码集合后步骤数变化（非按角色名）。storageKey 含{' '}
                <code>:v1</code>，重置可清完成态。多路由编排属业务仓。
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentLayoutTourDemo;
