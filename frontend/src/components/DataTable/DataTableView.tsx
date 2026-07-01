import { useEffect, useMemo, useState } from 'react';

import { useNotification } from '../../hooks/useNotification.js';

import { ProjectDetail } from '../viewbutton/index.js';

import { Toast } from '../ui/Toast.js';



import { DataTablePage } from './DataTablePage.js';

import { ProjectEditModal } from './ProjectEditModal.js';

import type { ImportFeedback, ResearchProject } from './types.js';



type DataTableViewProps = {

  projects: ResearchProject[];

  onDelete: (id: string) => void | Promise<void>;

  onDeleteMultiple: (ids: string[]) => void | Promise<void>;

  onDeleteAll: () => void | Promise<void>;

  onImport: (rows: Partial<ResearchProject>[], file?: File) => Promise<void>;

  onUpdateProject: (project: ResearchProject) => void | Promise<void>;

  onSyncProject?: (project: ResearchProject) => void;

  initialViewProjectId?: string | null;

  onInitialViewConsumed?: () => void;

};



export function DataTableView({

  projects,

  onDelete,

  onDeleteMultiple,

  onDeleteAll,

  onImport,

  onUpdateProject,

  onSyncProject,

  initialViewProjectId,

  onInitialViewConsumed,

}: DataTableViewProps) {
  const { message, notify, dismiss } = useNotification();

  const [editingProject, setEditingProject] = useState<ResearchProject | null>(null);

  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!initialViewProjectId) return;
    const exists = projects.some((p) => p.id === initialViewProjectId);
    if (exists) {
      setViewingProjectId(initialViewProjectId);
    }
    onInitialViewConsumed?.();
  }, [initialViewProjectId, projects, onInitialViewConsumed]);



  const viewingProject = useMemo(

    () => (viewingProjectId ? projects.find((p) => p.id === viewingProjectId) : undefined),

    [projects, viewingProjectId],

  );



  const handleImportFeedback = (result: ImportFeedback) => {

    notify(result.ok ? `Đã nhập ${result.count} bản ghi từ Excel.` : result.message);

  };



  const handleDeleteAll = () => {
    void Promise.resolve(onDeleteAll()).then(() => {
      notify(`Đã xóa tất cả ${projects.length} bản ghi.`);
    });
  };



  const handleEdit = (project: ResearchProject) => {

    setEditingProject(project);

  };



  const handleSaveEdit = (project: ResearchProject) => {
    void onUpdateProject(project);
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

          onBack={handleBackFromDetail}

          onEdit={handleEditFromDetail}

          onDelete={onDelete}

          onUpdateProject={onUpdateProject}

          onSyncProject={onSyncProject}

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

