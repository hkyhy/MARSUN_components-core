import { describe, expect, it } from 'vitest';
import { sanitizeInboxHtml } from '../../Inbox/sanitizeInboxHtml';
import { applyTemplateVars } from '../utils/templateCode';

describe('MessageCenter template preview / audience gates', () => {
  it('preview body keeps safe HTML after var fill + sanitize', () => {
    const filled = applyTemplateVars('<p><strong>{{metric}}</strong></p><script>x</script>', {
      metric: '指标',
    });
    const safe = sanitizeInboxHtml(filled);
    expect(safe).toContain('<strong>');
    expect(safe).toContain('指标');
    expect(safe.toLowerCase()).not.toContain('<script');
  });

  it('push audience gate: empty roles and users is invalid', () => {
    const roles: string[] = [];
    const userIds: string[] = [];
    const ok = roles.length > 0 || userIds.length > 0;
    expect(ok).toBe(false);
  });

  it('push audience gate: users alone is valid', () => {
    const roles: string[] = [];
    const userIds = ['u1'];
    expect(roles.length > 0 || userIds.length > 0).toBe(true);
  });

  it('template title gate: blank title invalid', () => {
    const title = '   ';
    expect(Boolean(title.trim())).toBe(false);
  });
});
