import { ProjectStatus, type ResearchProject } from '../DataTable/types.js';

import { APPROVAL_STEPS, NOTIFICATION_WINDOW_DAYS } from './approvalSteps.js';
import { daysUntilDeadline, parseDeadlineDate } from './parseDeadlineDate.js';
import type { DeadlineNotification } from './types.js';

function isProjectExcluded(project: ResearchProject): boolean {
  const status = String(project.status ?? '');
  return (
    status === ProjectStatus.COMPLETED ||
    status === ProjectStatus.LIQUIDATED ||
    status.includes('nghiệm thu') ||
    status.includes('Thanh lý')
  );
}

function getStepExpectedEnd(project: ResearchProject, step: number): string | undefined {
  const todo = project.workflowTodos?.find((entry) => entry.step === step);
  return todo?.dates?.expectedEnd;
}

export function detectDeadlineNotifications(projects: ResearchProject[]): DeadlineNotification[] {
  const now = new Date();
  const results: DeadlineNotification[] = [];

  for (const project of projects) {
    if (isProjectExcluded(project)) continue;

    const currentStep = project.workflowStep ?? 1;

    for (const approvalStep of APPROVAL_STEPS) {
      if (currentStep > approvalStep.step) continue;

      const expectedEnd = getStepExpectedEnd(project, approvalStep.step);
      if (!expectedEnd) continue;

      const deadlineDate = parseDeadlineDate(expectedEnd);
      if (!deadlineDate) continue;

      const daysRemaining = daysUntilDeadline(deadlineDate, now);
      if (daysRemaining > NOTIFICATION_WINDOW_DAYS) continue;

      results.push({
        id: `project-${project.id}-${approvalStep.step}`,
        entityType: 'project',
        entityId: project.id,
        title: project.title?.trim() || 'Đề tài không tên',
        deadlineDate,
        daysRemaining,
        deadlineLabel: approvalStep.label,
        isRead: false,
        createdAt: now,
        source: 'deadline',
      });
    }
  }

  return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
