/** Workflow steps that represent approval gates — aligned with WORKFLOW_STEPS in viewbutton/constants. */
export const APPROVAL_STEPS = [
  { step: 4, label: 'xét duyệt' },
  { step: 6, label: 'phê duyệt' },
  { step: 18, label: 'nghiệm thu' },
] as const;

export const NOTIFICATION_WINDOW_DAYS = 30;
