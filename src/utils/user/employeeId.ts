export const EMPLOYEE_ID_SIX_DIGIT_PATTERN = /^\d{6}$/;

export const EMPLOYEE_ID_FORMAT_MESSAGE = '工号必须为6位数字';

export const employeeIdFormatRule = {
  pattern: EMPLOYEE_ID_SIX_DIGIT_PATTERN,
  message: EMPLOYEE_ID_FORMAT_MESSAGE,
};

/** 校验工号是否为 6 位数字（不含种子账号豁免，用于用户创建/注册） */
export function isValidEmployeeIdFormat(employeeId: string): boolean {
  return EMPLOYEE_ID_SIX_DIGIT_PATTERN.test(String(employeeId ?? '').trim());
}
