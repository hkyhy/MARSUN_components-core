import { describe, expect, it } from 'vitest';
import {
  EMPLOYEE_ID_FORMAT_MESSAGE,
  employeeIdFormatRule,
  isValidEmployeeIdFormat,
} from '../employeeId';

describe('employeeId', () => {
  it('accepts 6-digit and non-6-digit employee ids', () => {
    expect(isValidEmployeeIdFormat('000001')).toBe(true);
    expect(isValidEmployeeIdFormat(' 123456 ')).toBe(true);
    expect(isValidEmployeeIdFormat('admin')).toBe(true);
    expect(isValidEmployeeIdFormat('admin001')).toBe(true);
    expect(isValidEmployeeIdFormat('12345')).toBe(true);
    expect(isValidEmployeeIdFormat('A-01_x')).toBe(true);
    expect(isValidEmployeeIdFormat('user@corp')).toBe(true);
  });

  it('rejects empty / whitespace / overlong / unsafe chars', () => {
    expect(isValidEmployeeIdFormat('')).toBe(false);
    expect(isValidEmployeeIdFormat('   ')).toBe(false);
    expect(isValidEmployeeIdFormat('has space')).toBe(false);
    expect(isValidEmployeeIdFormat('a'.repeat(51))).toBe(false);
    expect(isValidEmployeeIdFormat('中文工号')).toBe(false);
    expect(isValidEmployeeIdFormat('a<script>')).toBe(false);
  });

  it('exports antd format rule', () => {
    expect(employeeIdFormatRule.pattern.test('100001')).toBe(true);
    expect(employeeIdFormatRule.pattern.test('reviewer')).toBe(true);
    expect(employeeIdFormatRule.message).toBe(EMPLOYEE_ID_FORMAT_MESSAGE);
  });
});
