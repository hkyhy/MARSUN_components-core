import { MessageTemplateAdmin } from '@/components/Tools/MessageCenter';
import {
  listFixtureCatalog,
  listFixtureRoles,
  listFixtureTemplates,
  resetMsgCenterFixture,
  saveFixtureTemplate,
  setFixtureTemplateEnabled,
} from '@/components/Tools/MessageCenter/doc/msgCenter.fixture';
import React, { useCallback } from 'react';

resetMsgCenterFixture();

/** 2. 模板 CRUD（可写）：自动编号 / 中文事件 / 默认停用 / SSO 角色名 / catalog「插入变量」色块 */
const TemplateCrudDemo: React.FC = () => {
  const fetchTemplates = useCallback(async () => listFixtureTemplates(), []);
  const fetchEventCatalog = useCallback(async () => listFixtureCatalog(), []);
  const fetchAudienceRoles = useCallback(async () => listFixtureRoles(), []);
  const saveTemplate = useCallback(async (item: Record<string, unknown>) => {
    saveFixtureTemplate({
      id: item.id as string | undefined,
      code: String(item.code || ''),
      eventKey: String(item.eventKey || ''),
      scenario: String(item.scenario || ''),
      messageType: String(item.messageType || 'alert'),
      titleTemplate: String(item.titleTemplate || ''),
      bodyTemplate: String(item.bodyTemplate || ''),
      audienceRoles: (item.audienceRoles as string[]) || [],
      enabled: item.enabled === true,
    });
  }, []);

  return (
    <MessageTemplateAdmin
      canWrite
      fetchTemplates={fetchTemplates}
      fetchEventCatalog={fetchEventCatalog}
      fetchAudienceRoles={fetchAudienceRoles}
      saveTemplate={saveTemplate}
      setTemplateEnabled={async (item, enabled) => {
        if (item.id) setFixtureTemplateEnabled(item.id, enabled);
      }}
    />
  );
};

export default TemplateCrudDemo;
