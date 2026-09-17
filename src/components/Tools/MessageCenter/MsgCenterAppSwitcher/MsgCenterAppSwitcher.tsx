import { Select, Typography } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  filterMsgCenterSwitchableApps,
  getMsgCenterAppKey,
  resolveMsgCenterSwitchState,
  setMsgCenterAppKey,
  subscribeMsgCenterAppKey,
  type MsgCenterSwitchableApp,
} from '../msgCenterAppSwitch';

export type MsgCenterAppSwitcherProps = {
  /**
   * 返回当前用户**有权进入**的 SystemApp（须调用方用 EP 过滤；本组件再收窄到可切换 appKey）。
   * 禁止传入全量 Agent 目录。
   */
  listAuthorizedSystemApps: () => Promise<Array<{ code: string; name: string }>>;
  /** 本壳默认 appKey（无 session 时） */
  fallbackAppKey: string;
  className?: string;
  style?: React.CSSProperties;
  /** 切换成功回调（铃铛/Admin 另订阅 store） */
  onAppKeyChange?: (appKey: string) => void;
};

/**
 * AgentHub 消息中心 App 切换器：仅有权 + 本期可切换对；展示名取 SSO name。
 */
const MsgCenterAppSwitcher: React.FC<MsgCenterAppSwitcherProps> = ({
  listAuthorizedSystemApps,
  fallbackAppKey,
  className,
  style,
  onAppKeyChange,
}) => {
  const [apps, setApps] = useState<MsgCenterSwitchableApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(() => getMsgCenterAppKey(fallbackAppKey));

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await listAuthorizedSystemApps();
      const filtered = filterMsgCenterSwitchableApps(raw || []);
      setApps(filtered);
      const state = resolveMsgCenterSwitchState(filtered, fallbackAppKey);
      setCurrent(state.currentAppKey);
      if (getMsgCenterAppKey(fallbackAppKey) !== state.currentAppKey && filtered.length) {
        setMsgCenterAppKey(
          state.currentAppKey,
          filtered.map((a) => a.appKey),
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, [fallbackAppKey, listAuthorizedSystemApps]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    return subscribeMsgCenterAppKey((next) => {
      if (next) setCurrent(next);
    });
  }, []);

  const options = useMemo(
    () =>
      apps.map((a) => ({
        value: a.appKey,
        label: a.name,
      })),
    [apps],
  );

  if (error) {
    return (
      <Typography.Text type="danger" className={className} style={style}>
        应用列表不可用：{error}
      </Typography.Text>
    );
  }

  if (!loading && apps.length <= 1) {
    // 单权或无可切换：不展示切换器（PB-01：无第二项）
    return null;
  }

  return (
    <Select
      className={className}
      style={{ minWidth: 180, ...style }}
      loading={loading}
      value={current}
      options={options}
      optionFilterProp="label"
      placeholder="消息应用"
      aria-label="消息中心应用切换"
      onChange={(value: string) => {
        const allowed = apps.map((a) => a.appKey);
        setMsgCenterAppKey(value, allowed);
        setCurrent(value);
        onAppKeyChange?.(value);
      }}
    />
  );
};

export default MsgCenterAppSwitcher;
