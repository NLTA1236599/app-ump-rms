import { useMemo, useState } from 'react';
import type { ColumnId } from './types.js';
import { isValidDdMmYyyy, normalizeDdMmYyyy } from './formatDdMmYyyy.js';

export type SaveTaskPayload = {
  columnId: ColumnId;
  title: string;
  owner: string;
  unit: string;
  dueDateDisplay: string;
};

type AddTaskFormProps = {
  columnId: ColumnId;
  /** Prefill to match onboarding screenshot (`05/11/2024`) */
  initialDueDateDdMmYyyy?: string;
  onSave: (draft: SaveTaskPayload) => void | Promise<void>;
  onClose: () => void;
};

/**
 * Inline add-task form — spec §8.
 * All state is local per spec §8.4.
 */
export function AddTaskForm({
  columnId,
  initialDueDateDdMmYyyy = '05/11/2024',
  onSave,
  onClose,
}: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState('');
  const [unit, setUnit] = useState('');
  const [dueRaw, setDueRaw] = useState(initialDueDateDdMmYyyy);

  const isValid = title.trim().length > 0 && isValidDdMmYyyy(dueRaw);
  const dueDisplay = useMemo(() => normalizeDdMmYyyy(dueRaw), [dueRaw]);

  const handleSave = async () => {
    if (!isValid) return;
    await onSave({
      columnId,
      title: title.trim(),
      owner: owner.trim(),
      unit: unit.trim(),
      dueDateDisplay: dueDisplay,
    });
    onClose();
  };

  return (
    <div className="w-full animate-slideUp rounded-2xl border border-slate-200 bg-white p-4 pt-3 shadow-md">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        TÊN ĐỀ TÀI <span className="text-red-500">*</span>
      </span>
      <textarea
        autoFocus
        rows={3}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
      />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block min-w-0">
          <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
            CHỦ NHIỆM ĐỀ TÀI
          </span>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Chủ nhiệm..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
        <label className="block min-w-0">
          <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
            KHOA/ĐƠN VỊ
          </span>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="VD: Khoa Y..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
          HẠN HOÀN THÀNH
        </span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="dd/mm/yyyy"
          value={dueRaw}
          onChange={(e) => setDueRaw(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          aria-invalid={dueRaw.trim().length > 0 && !isValidDdMmYyyy(dueRaw)}
        />
      </label>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          disabled={!isValid}
          onClick={() => void handleSave()}
          className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Lưu Công việc
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
