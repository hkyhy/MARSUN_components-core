import { describe, expect, it } from 'vitest';
import {
  EMPLOYEE_ID_FORMAT_MESSAGE,
  employeeIdFormatRule,
  isValidEmployeeIdFormat,
} from '../employeeId';

describe('employeeId', () => {
  it('accepts 6-digit employee id', () => {
    expect(isValidEmployeeIdFormat('000001')).toBe(true);
    expect(isValidEmployeeIdFormat(' 123456 ')).toBe(true);
  });

  it('rejects non-6-digit employee id', () => {
    expect(isValidEmployeeIdFormat('admin')).toBe(false);
    expect(isValidEmployeeIdFormat('12345')).toBe(false);
    expect(isValidEmployeeIdFormat('1234567')).toBe(false);
    expect(isValidEmployeeIdFormat('12a456')).toBe(false);
  });

  it('exports antd format rule', () => {
    expect(employeeIdFormatRule.pattern.test('100001')).toBe(true);
    expect(employeeIdFormatRule.message).toBe(EMPLOYEE_ID_FORMAT_MESSAGE);
  });
});
