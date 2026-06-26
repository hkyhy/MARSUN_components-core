import { ICON_NAMES, ICON_REGISTRY, type IconName } from '@/components/Icons';
import { ColorPicker, InputNumber, Select, Space, Switch, Typography } from 'antd';
import React, { useMemo, useState } from 'react';
import styles from './style.module.scss';

const IconPlaygroundDemo: React.FC = () => {
  const [iconName, setIconName] = useState<IconName>('Star');
  const [size, setSize] = useState(24);
  const [color, setColor] = useState('#1677ff');
  const [spin, setSpin] = useState(false);
  const [rotate, setRotate] = useState(0);

  const Icon = ICON_REGISTRY[iconName];

  const grid = useMemo(
    () =>
      ICON_NAMES.map((name) => {
        const C = ICON_REGISTRY[name];
        return (
          <button
            key={name}
            type="button"
            className={styles['icon-grid-item']}
            onClick={() => setIconName(name)}
          >
            <C size={20} />
            <span>{name}</span>
          </button>
        );
      }),
    [],
  );

  return (
    <div className={styles['icon-playground']}>
      <Typography.Title level={5}>交互预览</Typography.Title>
      <Space wrap size="middle" align="center" className={styles['icon-controls']}>
        <Select
          style={{ width: 200 }}
          value={iconName}
          onChange={setIconName}
          options={ICON_NAMES.map((n) => ({ label: n, value: n }))}
          showSearch
        />
        <label className={styles['control-item']}>
          <span>尺寸</span>
          <InputNumber
            min={12}
            max={96}
            value={size}
            style={{ width: 72 }}
            onChange={(v) => setSize(v ?? 24)}
          />
        </label>
        <label className={styles['control-item']}>
          <span>颜色</span>
          <ColorPicker value={color} onChange={(_, hex) => setColor(hex)} />
        </label>
        <label className={styles['control-item']}>
          <span>旋转</span>
          <InputNumber
            min={0}
            max={360}
            value={rotate}
            style={{ width: 72 }}
            onChange={(v) => setRotate(v ?? 0)}
          />
        </label>
        <label className={styles['control-item']}>
          <span>旋转动画</span>
          <Switch checked={spin} onChange={setSpin} />
        </label>
      </Space>
      <div className={styles['icon-preview']}>
        <Icon size={size} color={color} spin={spin} rotate={rotate} />
        <code>{iconName}</code>
      </div>
      <Typography.Title level={5} style={{ marginTop: 24 }}>
        全部图标
      </Typography.Title>
      <div className={styles['icon-grid']}>{grid}</div>
    </div>
  );
};

export default IconPlaygroundDemo;
