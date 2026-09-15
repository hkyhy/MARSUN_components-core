import { describe, expect, it } from 'vitest';
import { buildAuditReplayCurl } from '../formatAuditCurl';

describe('buildAuditReplayCurl', () => {
  it('matches browser copy-as-curl shape', () => {
    const curl = buildAuditReplayCurl(
      {
        httpMethod: 'POST',
        path: '/api/v1/agents/s4-equipment/config/maintenanceCycleListPage',
        steps: [
          {
            stepType: 'REQUEST',
            input: { currentPage: 1, pageSize: 20, isActive: 1 },
          },
        ],
      },
      {
        origin: 'http://127.0.0.1:5176',
        authorization: 'Bearer test-token',
        cookie: 'marsun_session=abc',
        userAgent: 'Mozilla/5.0 test',
        acceptLanguage: 'zh-CN,zh;q=0.9',
        referer: 'http://127.0.0.1:5176/config/cycle',
      },
    );
    expect(
      curl.startsWith(
        "curl --url 'http://127.0.0.1:5176/api/v1/agents/s4-equipment/config/maintenanceCycleListPage'",
      ),
    ).toBe(true);
    expect(curl).toContain('  -X POST \\');
    expect(curl).toContain("-H 'Authorization: Bearer test-token'");
    expect(curl).toContain("-b 'marsun_session=abc'");
    expect(curl).toContain('--data-raw \'{"currentPage":1,"pageSize":20,"isActive":1}\'');
    expect(curl).not.toContain('<token>');
    expect(curl).not.toContain('5989');
  });
});
