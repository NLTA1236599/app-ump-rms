import { DataEntryPage } from '../DataEntry/DataEntryPage.js';
import type { ResearchProject } from './types.js';

type ProjectEditModalProps = {
  project: ResearchProject | null;
  onClose: () => void;
  onSave: (project: ResearchProject) => void;
};

export function ProjectEditModal({ project, onClose, onSave }: ProjectEditModalProps) {
  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/50
                 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-edit-title"
    >
      <div className="relative w-full max-w-7xl pb-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-[110] rounded-full bg-white px-3 py-1 text-xs font-bold
                     text-slate-600 shadow hover:bg-slate-100 sm:right-4 sm:top-4"
          aria-label="Đóng"
        >
          Đóng
        </button>
        <DataEntryPage
          mode="edit"
          project={project}
          embedded
          onSaveProject={(updated) => {
            onSave(updated);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
