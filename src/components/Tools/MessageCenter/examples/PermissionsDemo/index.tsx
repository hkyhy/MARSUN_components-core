import { MessageTemplateAdmin } from '@/components/Tools/MessageCenter';
import type { MessageAdminPermissions, MessageCrudFlags } from '@/components/Tools/MessageCenter';
import {
  listFixtureCatalog,
  listFixtureRoles,
  listFixtureTemplates,
  resetMsgCenterFixture,
} from '@/components/Tools/MessageCenter/doc/msgCenter.fixture';
import { Switch, Space, Checkbox } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';

resetMsgCenterFixture();

const ALL_ON: MessageCrudFlags = { create: true, read: true, update: true, delete: true };
const ALL_OFF: MessageCrudFlags = { create: false, read: false, update: false, delete: false };

const ACTIONS: (keyof MessageCrudFlags)[] = ['create', 'read', 'update', 'delete'];

/** 5. 权限对照：Showcase 快捷 canWrite + CRUD 拨动 */
const PermissionsDemo: React.FC = () => {
  const [useShortcut, setUseShortcut] = useState(true);
  const [canWrite, setCanWrite] = useState(false);
  const [template, setTemplate] = useState<MessageCrudFlags>({ ...ALL_OFF, read: true });
  const [push, setPush] = useState<MessageCrudFlags>({ ...ALL_OFF, read: true });
  const [variable, setVariable] = useState<MessageCrudFlags>({ ...ALL_OFF, read: true });

  const fetchTemplates = useCallback(async () => listFixtureTemplates(), []);
  const fetchEventCatalog = useCallback(async () => listFixtureCatalog(), []);
  const fetchAudienceRoles = useCallback(async () => listFixtureRoles(), []);

  const permissions = useMemo<MessageAdminPermissions>(
    () => ({ template, push, variable }),
    [template, push, variable],
  );

  const renderCrud = (
    label: string,
    value: MessageCrudFlags,
    onChange: (next: MessageCrudFlags) => void,
  ) => (
    <Space wrap>
      <span style={{ width: 56 }}>{label}</span>
      {ACTIONS.map((a) => (
        <Checkbox
          key={a}
          checked={value[a]}
          disabled={useShortcut}
          onChange={(e) => onChange({ ...value, [a]: e.target.checked })}
        >
          {a}
        </Checkbox>
      ))}
      <Checkbox
        checked={ACTIONS.every((a) => value[a])}
        disabled={useShortcut}
        onChange={(e) => onChange(e.target.checked ? { ...ALL_ON } : { ...ALL_OFF, read: true })}
      >
        全开
      </Checkbox>
    </Space>
  );

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Space>
        <span>Showcase 快捷 canWrite</span>
        <Switch
          checked={useShortcut}
          onChange={(v) => {
            setUseShortcut(v);
            if (v) setCanWrite(false);
          }}
        />
        {useShortcut ? (
          <Switch
            checked={canWrite}
            onChange={setCanWrite}
            checkedChildren="写开"
            unCheckedChildren="全关"
          />
        ) : null}
      </Space>
      {!useShortcut ? (
        <Space orientation="vertical" size={8}>
          {renderCrud('模板', template, setTemplate)}
          {renderCrud('推送', push, setPush)}
          {renderCrud('变量', variable, setVariable)}
        </Space>
      ) : null}
      <MessageTemplateAdmin
        canWrite={useShortcut ? canWrite : undefined}
        permissions={useShortcut ? undefined : permissions}
        fetchTemplates={fetchTemplates}
        fetchEventCatalog={fetchEventCatalog}
        fetchAudienceRoles={fetchAudienceRoles}
        saveTemplate={async () => undefined}
      />
    </Space>
  );
};

export default PermissionsDemo;
