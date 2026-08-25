/** 工号最大长度（与 SSO / Assets DB VarChar(50) 对齐） */
export const EMPLOYEE_ID_MAX_LENGTH = 50;

/**
 * 工号：1–50 位，字母/数字/`.` `_` `@` `-`（不再限制「仅 6 位数字」）。
 * 保留旧常量名以免破坏既有 import。
 */
export const EMPLOYEE_ID_PATTERN = /^[A-Za-z0-9._@-]{1,50}$/;

/** @deprecated 已放宽格式，等同 {@link EMPLOYEE_ID_PATTERN} */
export const EMPLOYEE_ID_SIX_DIGIT_PATTERN = EMPLOYEE_ID_PATTERN;

export const EMPLOYEE_ID_FORMAT_MESSAGE = '工号须为1–50位字母或数字（可含 . _ @ -）';

export const employeeIdFormatRule = {
  pattern: EMPLOYEE_ID_PATTERN,
  message: EMPLOYEE_ID_FORMAT_MESSAGE,
};

/** 校验工号格式（创建/注册用） */
export function isValidEmployeeIdFormat(employeeId: string): boolean {
  return EMPLOYEE_ID_PATTERN.test(String(employeeId ?? '').trim());
}
