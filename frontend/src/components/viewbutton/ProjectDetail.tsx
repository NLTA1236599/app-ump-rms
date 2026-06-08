import { useCallback, useEffect, useState } from 'react';

import type { ResearchProject } from '../DataTable/types.js';

import { WORKFLOW_STEPS } from './constants.js';
import { BackArrowIcon, ClipboardIcon } from './icons.js';
import { InfoSections } from './InfoSections.js';
import { WorkflowTimeline } from './WorkflowTimeline.js';
import { WorkflowTodoList } from './WorkflowTodoList.js';
import type { ProjectDetailProps } from './types.js';
import { workflowService } from './workflowService.js';

function persistProject(
  updated: ResearchProject,
  onPersist?: (p: ResearchProject) => void,
  onUpdate?: () => void,
) {
  onPersist?.(updated);
  onUpdate?.();
}

export function ProjectDetail({
  project,
  userEmail,
  onBack,
  onUpdate,
  onEdit,
  onPersist,
}: ProjectDetailProps) {
  const [localProject, setLocalProject] = useState(project);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing] = useState(false);
  const [editData] = useState<Partial<ResearchProject>>({});

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  const currentStep = localProject.workflowStep ?? 1;
  const isWorkflowComplete = currentStep >= WORKFLOW_STEPS.length;

  const handlePersist = useCallback(
    (updated: ResearchProject) => {
      setLocalProject(updated);
      persistProject(updated, onPersist, onUpdate);
    },
    [onPersist, onUpdate],
  );

  const handleStepClick = useCallback(
    async (stepIndex: number) => {
      const todoElement = document.getElementById(`todo-section-${stepIndex}`);
      todoElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });

      if (stepIndex === currentStep || isUpdating) return;

      const isRevert = stepIndex < currentStep;
      const action = isRevert ? 'quay lại' : 'chuyển đến';
      const stepLabel = WORKFLOW_STEPS[stepIndex - 1]?.label ?? `Bước ${stepIndex}`;

      if (!window.confirm(`Bạn có chắc chắn muốn ${action} bước: "${stepLabel}"?`)) {
        return;
      }

      setIsUpdating(true);
      try {
        const updated = workflowService.setWorkflowStep(
          localProject,
          stepIndex,
          userEmail,
          isRevert,
        );
        handlePersist(updated);
      } catch {
        window.alert('Cập nhật quy trình thất bại. Vui lòng thử lại.');
      } finally {
        setIsUpdating(false);
      }
    },
    [currentStep, handlePersist, isUpdating, localProject, userEmail],
  );

  return (
    <div className="flex min-h-[calc(100vh-110px)] flex-col">
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200
                   bg-white px-6 py-4 shadow-sm"
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-shrink-0 rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Quay lại"
          >
            <BackArrowIcon className="h-6 w-6" />
          </button>
          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold text-slate-800">
              {localProject.title || '—'}
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {localProject.projectCode ? (
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-sm">
                  {localProject.projectCode}
                </span>
              ) : null}
              {localProject.projectCode ? <span>•</span> : null}
              <span className="font-semibold text-blue-600">{localProject.leadAuthor}</span>
              {localProject.contractId ? (
                <>
                  <span>•</span>
                  <span className="font-mono text-sm">{localProject.contractId}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          <p className="text-xs italic text-slate-400">
            Nhấp vào nhiệm vụ trong biểu đồ để chuyển bước
          </p>
          {isWorkflowComplete ? (
            <span
              className="rounded-lg border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm
                         font-bold text-emerald-700"
            >
              Đã hoàn thành quy trình
            </span>
          ) : null}
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto bg-slate-50 p-4 md:p-6">
        <WorkflowTimeline
          project={localProject}
          currentStep={currentStep}
          history={localProject.workflowHistory}
          projectTodos={localProject.workflowTodos}
          projectStartDate={localProject.startDate}
          projectEndDate={localProject.endDate}
          onStepClick={handleStepClick}
          disabled={isUpdating}
        />

        <InfoSections
          project={localProject}
          currentStep={currentStep}
          isEditing={isEditing}
          editData={editData}
          onEdit={() => onEdit(localProject)}
        />

        <section>
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
            <ClipboardIcon className="h-5 w-5 text-slate-600" />
            Quản lý nhiệm vụ theo từng bước
          </h3>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {WORKFLOW_STEPS.map(({ step }) => (
              <WorkflowTodoList
                key={step}
                project={localProject}
                step={step}
                onUpdate={onUpdate}
                onPersist={handlePersist}
                disabled={isUpdating}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
