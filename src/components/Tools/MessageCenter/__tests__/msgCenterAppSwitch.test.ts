import { describe, expect, it, beforeEach } from 'vitest';
import {
  filterMsgCenterSwitchableApps,
  getMsgCenterAppKey,
  msgCenterAppKeyFromSystemAppCode,
  setMsgCenterAppKey,
  MSG_CENTER_APP_SWITCH_STORAGE_KEY,
} from '../msgCenterAppSwitch';

describe('msgCenterAppSwitch', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('maps s3-agent → s3-quality；equipment 同码', () => {
    expect(msgCenterAppKeyFromSystemAppCode('s3-agent')).toBe('s3-quality');
    expect(msgCenterAppKeyFromSystemAppCode('equipment-agent')).toBe('equipment-agent');
  });

  it('filter 只留可切换对且去重；丢弃 assets 等', () => {
    const out = filterMsgCenterSwitchableApps([
      { code: 'equipment-agent', name: '设备' },
      { code: 's3-agent', name: '质量' },
      { code: 'assets', name: '资产' },
      { code: 's3-agent', name: '质量重复' },
    ]);
    expect(out.map((x) => x.appKey)).toEqual(['equipment-agent', 's3-quality']);
    expect(out[1].name).toBe('质量');
  });

  it('set/get sessionStorage', () => {
    setMsgCenterAppKey('s3-quality', ['equipment-agent', 's3-quality']);
    expect(sessionStorage.getItem(MSG_CENTER_APP_SWITCH_STORAGE_KEY)).toBe('s3-quality');
    expect(getMsgCenterAppKey('equipment-agent')).toBe('s3-quality');
  });

  it('不允许的 appKey 抛错', () => {
    expect(() => setMsgCenterAppKey('assets', ['equipment-agent'])).toThrow(/不在可切换列表/);
  });
});
