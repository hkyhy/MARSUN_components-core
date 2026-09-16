import { MessageTemplateAdmin } from '@/components/Tools/MessageCenter';
import {
  listFixtureEvents,
  listFixtureRoles,
  listFixtureTemplates,
  resetMsgCenterFixture,
} from '@/components/Tools/MessageCenter/doc/msgCenter.fixture';
import { Switch, Space } from 'antd';
import React, { useCallback, useState } from 'react';

resetMsgCenterFixture();

/** 5. 权限对照：canWrite 开关 */
const PermissionsDemo: React.FC = () => {
  const [canWrite, setCanWrite] = useState(false);
  const fetchTemplates = useCallback(async () => listFixtureTemplates(), []);
  const fetchEventCatalog = useCallback(async () => listFixtureEvents(), []);
  const fetchAudienceRoles = useCallback(async () => listFixtureRoles(), []);

  return (
    <Space orientation="vertical" size={12} style={{ width: '100%' }}>
      <Space>
        <span>模拟写权限 canWrite</span>
        <Switch checked={canWrite} onChange={setCanWrite} />
      </Space>
      <MessageTemplateAdmin
        canWrite={canWrite}
        fetchTemplates={fetchTemplates}
        fetchEventCatalog={fetchEventCatalog}
        fetchAudienceRoles={fetchAudienceRoles}
        saveTemplate={async () => undefined}
      />
    </Space>
  );
};

export default PermissionsDemo;
