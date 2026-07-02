export type WorkflowPhaseBadge = {
  label: string;
  className: string;
};

export function getWorkflowPhaseBadge(currentStep: number): WorkflowPhaseBadge {
  if (currentStep >= 20) {
    return {
      label: 'Hoàn thành',
      className: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    };
  }
  if (currentStep >= 15) {
    return {
      label: 'Sắp nghiệm thu',
      className: 'text-purple-600 bg-purple-50 border-purple-100',
    };
  }
  if (currentStep >= 10) {
    return {
      label: 'Báo cáo tiến độ & giám định',
      className: 'text-amber-600 bg-amber-50 border-amber-100',
    };
  }
  return {
    label: 'Xét duyệt đề cương',
    className: 'text-blue-600 bg-blue-50 border-blue-100',
  };
}
