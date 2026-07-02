import type { WorkflowStepDef } from './types.js';

/** 1-based workflow steps for Đề tài KHCN cấp cơ sở. */
export const WORKFLOW_STEPS: WorkflowStepDef[] = [
  { step: 1, label: 'Đăng ký đề tài' },
  { step: 2, label: 'Nộp hồ sơ đăng ký' },
  { step: 3, label: 'Thẩm định hồ sơ' },
  { step: 4, label: 'Hội đồng xét duyệt đề cương' },
  { step: 5, label: 'Sửa đổi bổ sung (nếu có)' },
  { step: 6, label: 'Phê duyệt đề cương' },
  { step: 7, label: 'Ký hợp đồng' },
  { step: 8, label: 'Cấp kinh phí đợt 1' },
  { step: 9, label: 'Khởi động thực hiện' },
  { step: 10, label: 'Báo cáo tiến độ lần 1' },
  { step: 11, label: 'Giám sát tiến độ' },
  { step: 12, label: 'Báo cáo tiến độ lần 2' },
  { step: 13, label: 'Báo cáo giám định' },
  { step: 14, label: 'Báo cáo tiến độ lần 3' },
  { step: 15, label: 'Hoàn thiện sản phẩm' },
  { step: 16, label: 'Nộp hồ sơ nghiệm thu' },
  { step: 17, label: 'Thẩm định hồ sơ nghiệm thu' },
  { step: 18, label: 'Hội đồng nghiệm thu' },
  { step: 19, label: 'Cấp GCN kết quả' },
  { step: 20, label: 'Nghiệm thu chính thức' },
  { step: 21, label: 'Lưu chiểu kết quả' },
  { step: 22, label: 'Thanh lý đề tài' },
];
