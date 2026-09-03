/** 中文 stub；不引入 @kne/react-intl */
const locale = {
  submit: '提交',
  cancel: '取消',
  complete: '完成',
  prev: '上一步',
  next: '下一步',
  addText: '添加',
  deleteText: '删除',
  untitledStep: '第{index}步',
  nestLevel: '第{level}级',
  nestExpand: '展开第{level}级',
  nestCollapse: '收起第{level}级',
} as const;

export type FormInfoLocaleKey = keyof typeof locale;
export default locale;
