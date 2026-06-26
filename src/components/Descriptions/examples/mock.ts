import type { DescriptionItem } from '@/components';

/** 基础描述列表 mock 数据 */
export const MOCK_BASIC_ITEMS: DescriptionItem[] = [
  { label: '文件名', value: '示例文档.pdf' },
  { label: '大小', value: '2.4 MB' },
  { label: '上传者', value: '张三' },
  { label: '状态', value: '已通过' },
  { label: '上传时间', value: '2026-05-21 10:30:00' },
  { label: '备注', value: '这是一个示例文件', span: 2 },
];

/** 三列资产详情 mock 数据 */
export const MOCK_ASSET_ITEMS: DescriptionItem[] = [
  { label: '资产编号', value: 'AST-2026-001' },
  { label: '资产名称', value: 'MacBook Pro 16寸' },
  { label: '分类', value: '电子设备' },
  { label: '品牌', value: 'Apple' },
  { label: '型号', value: 'M4 Max' },
  { label: '购入价格', value: '¥27,999' },
  { label: '使用人', value: '李四' },
  { label: '所属部门', value: '技术部' },
  { label: '状态', value: '使用中' },
];
