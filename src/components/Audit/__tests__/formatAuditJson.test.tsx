import { describe, expect, it } from 'vitest';
import {
  formatAuditJson,
  indentJsonLike,
  isTruncatedAuditText,
  repairTruncatedJson,
  sanitizeAuditCurl,
  unwrapAuditJson,
} from '../formatAuditJson';

describe('formatAuditJson', () => {
  it('unwraps nested JSON string body', () => {
    const raw = {
      httpStatus: 200,
      body: '{"code":0,"data":{"pageData":[{"machineNo":"1"}]}}',
    };
    const text = formatAuditJson(raw);
    expect(text).toContain('"code": 0');
    expect(text).toContain('"machineNo": "1"');
    expect(text).not.toContain('\\"code\\"');
  });

  it('pretty-prints truncated JSON without outer quote wrapping', () => {
    const s =
      '{"code":0,"data":{"pageData":[{"factoryCode":"1600","machineNo":"细纱001"}…[truncated]';
    expect(isTruncatedAuditText(s)).toBe(true);
    const text = formatAuditJson(s);
    expect(text.startsWith('"')).toBe(false);
    expect(text).toContain('"code"');
    expect(text).toContain('…[truncated]');
    expect(text).not.toMatch(/^"\{\\"code\\"/);
  });

  it('formats agents slim preview object', () => {
    const text = formatAuditJson({
      _truncated: true,
      preview: '{"code":0,"data":{"x":1}}…[truncated]',
    });
    expect(text).toContain('"code": 0');
    expect(text).toContain('…[truncated]');
  });

  it('pretty-prints plain objects', () => {
    expect(formatAuditJson({ a: 1 })).toBe('{\n  "a": 1\n}');
  });

  it('repairTruncatedJson closes braces', () => {
    const repaired = repairTruncatedJson('{"a":1,"b":[{"c":2');
    expect(() => JSON.parse(repaired)).not.toThrow();
    expect(JSON.parse(repaired)).toEqual({ a: 1, b: [{ c: 2 }] });
  });

  it('indentJsonLike does not wrap with quotes', () => {
    const t = indentJsonLike('{"a":1}');
    expect(t.startsWith('{')).toBe(true);
    expect(t).toContain('\n');
  });

  it('leaves non-json string as unwrap identity', () => {
    expect(unwrapAuditJson('hello')).toBe('hello');
  });
});

describe('sanitizeAuditCurl', () => {
  it('inserts -H before glued Content-Type', () => {
    const broken =
      "curl -X POST '/api/v1/x' -H 'Authorization: ***REDACTED***'Content-Type: application/json' --data '{}'";
    const s = sanitizeAuditCurl(broken);
    expect(s).toContain("-H 'Content-Type: application/json'");
    expect(s).toContain("-H 'Authorization: Bearer <token>'");
    expect(s).not.toContain("***REDACTED***'Content-Type");
  });
});
