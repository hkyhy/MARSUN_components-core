export { MessageTemplateAdmin } from './MessageTemplateAdmin';
export type {
  MessageTemplateAdminProps,
  MessageTemplateAdminItem,
  MessageEventCatalogItem,
  MessageEventCatalogPayload,
  MessageAudienceRoleOption,
  MessageTemplateVariable,
} from './MessageTemplateAdmin';
export {
  generateTemplateCode,
  normalizeTemplatePlaceholders,
  applyTemplateVars,
  stripHtmlToText,
} from './utils/templateCode';
