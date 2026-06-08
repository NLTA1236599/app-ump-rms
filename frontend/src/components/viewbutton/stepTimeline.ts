import { WORKFLOW_STEPS } from './constants.js';
import { addMonths, daysBetween, parseDate } from './parseDate.js';
import { workflowService } from './workflowService.js';
import type { ResearchProject } from '../DataTable/types.js';
import type { StepStatus } from './types.js';
import { getStepStatus } from './workflowStatus.js';

export type TimelineBar = {
  step: number;
  label: string;
  status: StepStatus;
  leftPct: number;
  widthPct: number;
};

export type MonthLabel = {
  label: string;
  leftPct: number;
};

export type TimelineView = {
  viewStart: Date;
  viewEnd: Date;
  totalDays: number;
  bars: TimelineBar[];
  months: MonthLabel[];
  todayLeftPct: number;
};

function getStepRange(
  project: ResearchProject,
  step: number,
  projectStart: Date,
  projectEnd: Date,
): { start: Date; end: Date } {
  const saved = workflowService.getStepDates(project, step);
  const savedStart = parseDate(saved.expectedStart);
  const savedEnd = parseDate(saved.expectedEnd);
  if (savedStart && savedEnd) return { start: savedStart, end: savedEnd };

  const totalSteps = WORKFLOW_STEPS.length;
  const totalMs = projectEnd.getTime() - projectStart.getTime();
  const stepMs = totalMs / totalSteps;
  const start = new Date(projectStart.getTime() + (step - 1) * stepMs);
  const end = new Date(projectStart.getTime() + step * stepMs);
  return { start, end };
}

function pctInView(date: Date, viewStart: Date, totalDays: number): number {
  const dayOffset = (date.getTime() - viewStart.getTime()) / 86400000;
  return (dayOffset / totalDays) * 100;
}

export function buildTimelineView(
  project: ResearchProject,
  currentStep: number,
): TimelineView {
  const rawStart = parseDate(project.startDate) ?? new Date();
  const rawEnd = parseDate(project.endDate) ?? addMonths(rawStart, 12);
  const viewStart = addMonths(rawStart, -1);
  const viewEnd = addMonths(rawEnd, 1);
  const totalDays = daysBetween(viewStart, viewEnd);

  const bars: TimelineBar[] = WORKFLOW_STEPS.map(({ step, label }) => {
    const { start, end } = getStepRange(project, step, rawStart, rawEnd);
    const leftPct = pctInView(start, viewStart, totalDays);
    const rightPct = pctInView(end, viewStart, totalDays);
    const widthPct = Math.max(0.5, rightPct - leftPct);

    return {
      step,
      label,
      status: getStepStatus(step, currentStep),
      leftPct,
      widthPct,
    };
  });

  const months: MonthLabel[] = [];
  const cursor = new Date(viewStart.getFullYear(), viewStart.getMonth(), 1);
  while (cursor <= viewEnd) {
    months.push({
      label: `T${cursor.getMonth() + 1}/${cursor.getFullYear()}`,
      leftPct: pctInView(cursor, viewStart, totalDays),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const today = new Date();
  const todayLeftPct = pctInView(today, viewStart, totalDays);

  return { viewStart, viewEnd, totalDays, bars, months, todayLeftPct };
}

export function barColorClass(status: StepStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500';
    case 'current':
      return 'bg-blue-500 animate-pulse';
    default:
      return 'bg-slate-300 opacity-60';
  }
}

export function badgeClass(status: StepStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-600 border-emerald-200';
    case 'current':
      return 'bg-blue-100 text-blue-600 border-blue-200';
    default:
      return 'bg-slate-50 text-slate-400 border-slate-200';
  }
}
