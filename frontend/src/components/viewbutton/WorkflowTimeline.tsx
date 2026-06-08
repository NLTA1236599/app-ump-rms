import { useEffect, useRef } from 'react';

import { WORKFLOW_STEPS } from './constants.js';
import { badgeClass, barColorClass, buildTimelineView } from './stepTimeline.js';
import type { WorkflowTimelineProps } from './types.js';

const ROW_HEIGHT = 40;

export function WorkflowTimeline({
  project,
  currentStep,
  onStepClick,
  disabled = false,
}: WorkflowTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const view = buildTimelineView(project, currentStep);
  const showToday = view.todayLeftPct >= 0 && view.todayLeftPct <= 100;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !showToday) return;
    const target = (view.todayLeftPct / 100) * el.scrollWidth - el.clientWidth / 2;
    el.scrollLeft = Math.max(0, target);
  }, [view.todayLeftPct, showToday]);

  const handleStepClick = (step: number) => {
    if (disabled) return;
    onStepClick?.(step);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-800">Tiến độ thực hiện (Gantt Chart)</h3>
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded-full bg-emerald-500" />
            Hoàn thành
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded-full bg-blue-500" />
            Đang thực hiện
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded-full bg-slate-300" />
            Chưa đến
          </span>
        </div>
      </div>

      <div className="flex">
        <div className="hidden w-[300px] flex-shrink-0 border-r border-slate-100 md:block">
          <div className="sticky top-0 flex h-10 items-center bg-slate-50 px-4 text-xs font-bold text-slate-500">
            Nhiệm vụ
          </div>
          {WORKFLOW_STEPS.map(({ step, label }) => {
            const status = view.bars.find((b) => b.step === step)?.status ?? 'upcoming';
            return (
              <button
                key={step}
                type="button"
                disabled={disabled}
                onClick={() => handleStepClick(step)}
                className="flex w-full items-center gap-2 border-b border-slate-50 px-3 text-left
                           hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
                style={{ height: ROW_HEIGHT }}
              >
                <span
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full
                              border text-xs font-bold ${badgeClass(status)}`}
                >
                  {status === 'completed' ? '✓' : step}
                </span>
                <span
                  className={`truncate text-sm font-medium ${
                    status === 'upcoming' ? 'text-slate-400' : 'text-slate-700'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <div ref={scrollRef} className="min-w-0 flex-1 overflow-x-auto">
          <div className="relative min-w-[800px]" style={{ width: '200%' }}>
            <div className="sticky top-0 z-10 h-10 border-b border-slate-100 bg-slate-50">
              {view.months.map((m) => (
                <span
                  key={`${m.label}-${m.leftPct}`}
                  className="absolute top-2 text-[10px] font-semibold text-slate-400"
                  style={{ left: `${m.leftPct}%` }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <div className="relative">
              {view.months.map((m) => (
                <div
                  key={`grid-${m.label}`}
                  className="absolute top-0 bottom-0 border-l border-dashed border-slate-100"
                  style={{ left: `${m.leftPct}%` }}
                />
              ))}

              {showToday && (
                <div
                  className="absolute top-0 bottom-0 z-20 w-0.5 bg-amber-500"
                  style={{ left: `${view.todayLeftPct}%` }}
                >
                  <span
                    className="absolute -top-1 left-0 rounded bg-amber-500 px-1 text-[9px]
                               font-bold text-white"
                  >
                    Hôm nay
                  </span>
                </div>
              )}

              {view.bars.map((bar) => (
                <div
                  key={bar.step}
                  className="relative border-b border-slate-50"
                  style={{ height: ROW_HEIGHT }}
                >
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleStepClick(bar.step)}
                    className="group absolute inset-0 disabled:cursor-wait"
                  >
                    <div
                      className={`absolute h-4 rounded-full ${barColorClass(bar.status)}`}
                      style={{
                        left: `${bar.leftPct}%`,
                        width: `${bar.widthPct}%`,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        marginTop: 4,
                      }}
                    />
                    <span
                      className="pointer-events-none absolute -top-6 left-1/2 z-30 -translate-x-1/2
                                 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] text-white
                                 opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ left: `${bar.leftPct + bar.widthPct / 2}%` }}
                    >
                      {bar.label}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
