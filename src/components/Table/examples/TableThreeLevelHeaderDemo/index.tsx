import { Table, type TablePrefs } from '@/components';
import classNames from 'classnames';
import React, { useCallback, useState } from 'react';
import styles from './style.module.scss';

type DemoRow = {
  id: string;
  factory: string;
  variety: string;
  cv: number;
  neps: number;
  strength: number;
  micronaire: number;
};

const ROWS: DemoRow[] = [
  { id: '1', factory: '1000', variety: 'JC40', cv: 12.1, neps: 18, strength: 220, micronaire: 4.2 },
  { id: '2', factory: '2000', variety: 'JC32', cv: 13.2, neps: 22, strength: 210, micronaire: 4.0 },
];

const MEMORY = new Map<string, TablePrefs>();

/** 三级表头 + 列配置（成纱在线 → 指标 → SAP） */
const TableThreeLevelHeaderDemo: React.FC = () => {
  const fetchTablePrefs = useCallback(async (tableName: string) => {
    return MEMORY.get(tableName) ?? null;
  }, []);

  const saveTablePrefs = useCallback(async (tableName: string, prefs: TablePrefs) => {
    MEMORY.set(tableName, prefs);
  }, []);

  const [hint, setHint] = useState('');

  return (
    <div
      className={classNames(
        'table-three-level-header-demo-root',
        styles['table-three-level-header-demo-root'],
      )}
    >
      <p className={styles.hint}>
        三级表头：一级批标分类 → 二级指标 → 三级 SAP 参数；齿轮列配置经 TablePrefs v2 持久化。
        {hint ? ` ${hint}` : null}
      </p>
      <Table<DemoRow>
        rowKey="id"
        pagination={false}
        tableName="demo_table_three_level"
        fetchTablePrefs={fetchTablePrefs}
        saveTablePrefs={saveTablePrefs}
        onTablePrefsChange={(p) => setHint(`已保存列 ${p.columns.length} 项`)}
        dataSource={ROWS}
        columns={[
          { title: '分厂', dataIndex: 'factory', key: 'factory', width: 96, fixed: 'left' },
          { title: '品种', dataIndex: 'variety', key: 'variety', width: 120, fixed: 'left' },
          {
            title: '成纱在线',
            key: 'yarnOnline',
            align: 'center',
            children: [
              {
                title: '筒纱电子条干',
                key: 'coneEvenness',
                align: 'center',
                children: [
                  {
                    title: '条干CV%',
                    dataIndex: 'cv',
                    key: 'yarnOnline_coneEvenness_cv',
                    width: 88,
                  },
                  {
                    title: '千米棉结+200%',
                    dataIndex: 'neps',
                    key: 'yarnOnline_coneEvenness_neps',
                    width: 110,
                  },
                ],
              },
            ],
          },
          {
            title: '成纱离线',
            key: 'yarnOffline',
            align: 'center',
            children: [
              {
                title: '细纱强力',
                key: 'ringStrength',
                align: 'center',
                children: [
                  {
                    title: '修正前平均强力',
                    dataIndex: 'strength',
                    key: 'yarnOffline_ringStrength_strength',
                    width: 120,
                  },
                ],
              },
            ],
          },
          {
            title: '配料离线',
            key: 'blendOffline',
            align: 'center',
            children: [
              {
                title: '配棉',
                key: 'cottonBlend',
                align: 'center',
                children: [
                  {
                    title: '马克隆值',
                    dataIndex: 'micronaire',
                    key: 'blendOffline_cottonBlend_micronaire',
                    width: 96,
                  },
                ],
              },
            ],
          },
          {
            title: '工艺离线',
            key: 'processOffline',
            align: 'center',
            children: [],
          },
        ]}
      />
    </div>
  );
};

export default TableThreeLevelHeaderDemo;
