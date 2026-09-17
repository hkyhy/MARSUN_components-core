import { MessageTemplateAdmin } from '@/components/Tools/MessageCenter';
import {
  deleteFixturePushRule,
  deleteFixtureVariable,
  listFixtureCatalog,
  listFixturePushRules,
  listFixtureRoles,
  listFixtureTemplates,
  listFixtureVariablesAdmin,
  resetMsgCenterFixture,
  saveFixturePushRule,
  saveFixtureTemplate,
  saveFixtureVariable,
  setFixturePushRuleEnabled,
  setFixtureTemplateEnabled,
} from '@/components/Tools/MessageCenter/doc/msgCenter.fixture';
import React, { useCallback } from 'react';

resetMsgCenterFixture();

/** 模板 + 推送规则 + 变量 CRUD（Showcase；fixture 非运行时 mock） */
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
      fetchPushRules={async () => listFixturePushRules()}
      savePushRule={async (item) => {
        saveFixturePushRule({
          id: item.id,
          code: item.code,
          label: item.label,
          eventKey: String(item.eventKey || ''),
          templateCode: item.templateCode,
          levels: item.levels,
          audienceRoles: item.audienceRoles,
          channels: item.channels,
          slaHours: item.slaHours,
          scanLookbackDays: item.scanLookbackDays,
          enabled: item.enabled !== false,
        });
      }}
      setPushRuleEnabled={async (item, enabled) => {
        if (item.id) setFixturePushRuleEnabled(item.id, enabled);
      }}
      deletePushRule={async (item) => {
        if (item.id) deleteFixturePushRule(item.id);
      }}
      fetchVariables={async () => listFixtureVariablesAdmin()}
      saveVariable={async (item) => {
        saveFixtureVariable(item);
      }}
      deleteVariable={async (item) => {
        deleteFixtureVariable(item.key);
      }}
    />
  );
};

export default TemplateCrudDemo;
