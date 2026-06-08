import { WORKFLOW_STEPS } from './constants.js';
import { CalendarIcon, ClockIcon } from './icons.js';
import { toInputDate } from './parseDate.js';
import { workflowService } from './workflowService.js';
import type { StepDates, WorkflowHistoryEntry, WorkflowTodoListProps } from './types.js';

function findHistoryStart(history: WorkflowHistoryEntry[], step: number): string | undefined {
  return history.find((h) => h.step === step)?.updatedAt;
}

function findHistoryEnd(history: WorkflowHistoryEntry[], step: number): string | undefined {
  return history.find((h) => h.step > step)?.updatedAt;
}

function DateInputPair({
  label,
  tone,
  startValue,
  endValue,
  startAuto,
  endAuto,
  disabled,
  onStartChange,
  onEndChange,
}: {
  label: string;
  tone: 'expected' | 'actual';
  startValue: string;
  endValue: string;
  startAuto?: boolean;
  endAuto?: boolean;
  disabled?: boolean;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) {
  const isActual = tone === 'actual';
  const sectionClass = isActual
    ? 'pt-2 border-t border-slate-100'
    : '';
  const labelClass = isActual ? 'text-amber-500' : 'text-slate-500';
  const inputClass = isActual
    ? 'bg-amber-50/30 border-amber-100 text-amber-900 focus:ring-amber-500'
    : 'bg-slate-50 border-slate-100 text-slate-700 focus:ring-blue-500';
  const floatClass = isActual ? 'text-amber-400' : 'text-slate-400';
  const Icon = isActual ? ClockIcon : CalendarIcon;
  const iconClass = isActual ? 'text-amber-500' : 'text-blue-500';

  return (
    <div className={sectionClass}>
      <p className={`mb-3 flex items-center gap-1 text-[10px] font-bold uppercase ${labelClass}`}>
        <Icon className={`h-3.5 w-3.5 ${iconClass}`} />
        {label}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {(['Bắt đầu', 'Kết thúc'] as const).map((fieldLabel, i) => {
          const value = i === 0 ? startValue : endValue;
          const onChange = i === 0 ? onStartChange : onEndChange;
          const isAuto = i === 0 ? startAuto : endAuto;
          return (
            <div key={fieldLabel} className="relative">
              <span
                className={`absolute -top-2 left-2 bg-white px-1 text-[9px] font-bold uppercase
                            ${floatClass}`}
              >
                {fieldLabel}
              </span>
              <input
                type="date"
                disabled={disabled}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-xs font-semibold
                            focus:ring-2 disabled:cursor-wait disabled:opacity-60 ${inputClass}`}
              />
              {isAuto && (
                <p className="mt-1 text-[10px] font-medium italic text-amber-600">
                  * Tự động ghi nhận từ lịch sử hệ thống
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WorkflowTodoList({
  project,
  step,
  onUpdate,
  onPersist,
  disabled = false,
}: WorkflowTodoListProps) {
  const currentStep = project.workflowStep ?? 1;
  const isCurrent = step === currentStep;
  const isCompleted = currentStep > step;
  const stepDef = WORKFLOW_STEPS.find((s) => s.step === step);
  const label = stepDef?.label ?? `Bước ${step}`;

  const history = project.workflowHistory ?? [];
  const stepDates: StepDates = workflowService.getStepDates(project, step);

  const historyStart = findHistoryStart(history, step);
  const historyEnd = findHistoryEnd(history, step);
  const actualStartManual = Boolean(stepDates.actualStart);
  const actualEndManual = Boolean(stepDates.actualEnd);

  const persist = (updated: typeof project) => {
    onPersist?.(updated);
    onUpdate();
  };

  const handleDateChange = (field: keyof StepDates, value: string) => {
    const updated = workflowService.updateStepDates(project, step, { [field]: value });
    persist(updated);
  };

  const handleToggleComplete = () => {
    const targetStep = isCompleted ? step : step + 1;
    const updated = workflowService.setWorkflowStep(project, targetStep, 'user');
    persist(updated);
  };

  return (
    <div
      id={`todo-section-${step}`}
      className={`rounded-2xl bg-white p-6 shadow-sm ${
        isCurrent ? 'border border-blue-300 ring-2 ring-blue-50' : 'border border-slate-200'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500">
            BƯỚC {step}
          </p>
          <p className="text-base font-bold text-slate-800">{label}</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={isCompleted}
            disabled={disabled}
            onChange={handleToggleComplete}
            className="h-5 w-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500
                       disabled:cursor-wait"
          />
          <span
            className={`text-xs font-semibold ${isCompleted ? 'text-emerald-600' : 'text-slate-500'}`}
          >
            {isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
          </span>
        </label>
      </div>

      <DateInputPair
        label="Thời gian dự kiến"
        tone="expected"
        startValue={toInputDate(stepDates.expectedStart)}
        endValue={toInputDate(stepDates.expectedEnd)}
        disabled={disabled}
        onStartChange={(v) => handleDateChange('expectedStart', v)}
        onEndChange={(v) => handleDateChange('expectedEnd', v)}
      />

      <DateInputPair
        label="Thời gian thực hiện thực tế"
        tone="actual"
        startValue={toInputDate(stepDates.actualStart ?? historyStart)}
        endValue={toInputDate(stepDates.actualEnd ?? historyEnd)}
        startAuto={!actualStartManual && Boolean(historyStart)}
        endAuto={!actualEndManual && Boolean(historyEnd)}
        disabled={disabled}
        onStartChange={(v) => handleDateChange('actualStart', v)}
        onEndChange={(v) => handleDateChange('actualEnd', v)}
      />
    </div>
  );
}
