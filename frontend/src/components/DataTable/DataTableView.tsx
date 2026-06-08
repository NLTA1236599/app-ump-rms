import { useMemo, useState } from 'react';

import { useAuthContext } from '../../contexts/AuthContext.js';
import { useNotification } from '../../hooks/useNotification.js';
import { ProjectDetail } from '../viewbutton/index.js';
import { Toast } from '../ui/Toast.js';

import { DataTablePage } from './DataTablePage.js';
import { ProjectEditModal } from './ProjectEditModal.js';
import type { ImportFeedback, ResearchProject } from './types.js';

type DataTableViewProps = {
  projects: ResearchProject[];
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onDeleteAll: () => void;
  onImport: (rows: Partial<ResearchProject>[]) => void;
  onUpdateProject: (project: ResearchProject) => void;
};

export function DataTableView({
  projects,
  onDelete,
  onDeleteMultiple,
  onDeleteAll,
  onImport,
  onUpdateProject,
}: DataTableViewProps) {
  const { user } = useAuthContext();
  const { message, notify, dismiss } = useNotification();
  const [editingProject, setEditingProject] = useState<ResearchProject | null>(null);
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);

  const viewingProject = useMemo(
    () => (viewingProjectId ? projects.find((p) => p.id === viewingProjectId) : undefined),
    [projects, viewingProjectId],
  );

  const userEmail = user?.username ?? 'user';

  const handleImportFeedback = (result: ImportFeedback) => {
    notify(result.ok ? `Đã nhập ${result.count} bản ghi từ Excel.` : result.message);
  };

  const handleDeleteAll = () => {
    onDeleteAll();
    notify(`Đã xóa tất cả ${projects.length} bản ghi.`);
  };

  const handleEdit = (project: ResearchProject) => {
    setEditingProject(project);
  };

  const handleSaveEdit = (project: ResearchProject) => {
    onUpdateProject(project);
  };

  const handleView = (project: ResearchProject) => {
    setViewingProjectId(project.id);
  };

  const handleBackFromDetail = () => {
    setViewingProjectId(null);
  };

  const handleEditFromDetail = (project: ResearchProject) => {
    setViewingProjectId(null);
    setEditingProject(project);
  };

  if (viewingProject) {
    return (
      <>
        <ProjectDetail
          project={viewingProject}
          userEmail={userEmail}
          onBack={handleBackFromDetail}
          onUpdate={() => {}}
          onPersist={onUpdateProject}
          onEdit={handleEditFromDetail}
        />
        <ProjectEditModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={handleSaveEdit}
        />
        <Toast message={message} onDismiss={dismiss} />
      </>
    );
  }

  return (
    <>
      <DataTablePage
        projects={projects}
        onDelete={onDelete}
        onEdit={handleEdit}
        onView={handleView}
        onImport={onImport}
        onImportFeedback={handleImportFeedback}
        onDeleteMultiple={onDeleteMultiple}
        onDeleteAll={handleDeleteAll}
      />
      <ProjectEditModal
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSave={handleSaveEdit}
      />
      <Toast message={message} onDismiss={dismiss} />
    </>
  );
}
