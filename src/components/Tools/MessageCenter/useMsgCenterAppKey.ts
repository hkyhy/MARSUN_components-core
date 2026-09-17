import { useEffect, useState } from 'react';
import {
  getMsgCenterAppKey,
  subscribeMsgCenterAppKey,
  bindMsgCenterAppKeyStorageSync,
} from './msgCenterAppSwitch';

/** 订阅当前消息中心 appKey（Hub 切换后触发重渲染） */
export function useMsgCenterAppKey(fallbackAppKey: string): string {
  const [appKey, setAppKey] = useState(() => getMsgCenterAppKey(fallbackAppKey));

  useEffect(() => {
    setAppKey(getMsgCenterAppKey(fallbackAppKey));
    const unsub = subscribeMsgCenterAppKey((next) => {
      setAppKey(next || getMsgCenterAppKey(fallbackAppKey));
    });
    const unbind = bindMsgCenterAppKeyStorageSync();
    return () => {
      unsub();
      unbind();
    };
  }, [fallbackAppKey]);

  return appKey;
}
