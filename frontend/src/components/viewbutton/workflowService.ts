import type { ResearchProject } from '../DataTable/types.js';

import type { StepDates, WorkflowHistoryEntry, WorkflowTodo } from './types.js';

function nowIso(): string {
  return new Date().toISOString();
}

function getTodos(project: ResearchProject): WorkflowTodo[] {
  return project.workflowTodos ?? [];
}

function getHistory(project: ResearchProject): WorkflowHistoryEntry[] {
  return project.workflowHistory ?? [];
}

function upsertTodo(todos: WorkflowTodo[], step: number, dates: Partial<StepDates>): WorkflowTodo[] {
  const existing = todos.find((t) => t.step === step);
  if (existing) {
    return todos.map((t) =>
      t.step === step ? { ...t, dates: { ...t.dates, ...dates } } : t,
    );
  }
  return [...todos, { step, dates: { ...dates } }];
}

export const workflowService = {
  setWorkflowStep(
    project: ResearchProject,
    targetStep: number,
    userEmail: string,
    isRevert?: boolean,
  ): ResearchProject {
    const history = getHistory(project);
    const entry: WorkflowHistoryEntry = {
      step: targetStep,
      updatedAt: nowIso(),
      user: userEmail,
      isRevert,
    };

    return {
      ...project,
      workflowStep: targetStep,
      workflowHistory: [...history, entry],
    };
  },

  updateStepDates(
    project: ResearchProject,
    step: number,
    dates: Partial<StepDates>,
  ): ResearchProject {
    const todos = upsertTodo(getTodos(project), step, dates);
    return { ...project, workflowTodos: todos };
  },

  getStepDates(project: ResearchProject, step: number): StepDates {
    return getTodos(project).find((t) => t.step === step)?.dates ?? {};
  },
};
