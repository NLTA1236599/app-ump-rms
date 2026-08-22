import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuthContext } from '../../contexts/AuthContext.js';
import { useNotification } from '../../hooks/useNotification.js';
import { ProjectDetail } from '../viewbutton/index.js';
import { Toast } from '../ui/Toast.js';
import { DataTablePage } from './DataTablePage.js';
import { dedupeProjects } from './dedupeProjects.js';
import { ProjectEditModal } from './ProjectEditModal.js';
import type { ImportFeedback, ResearchProject } from './types.js';

type DataTableViewProps = {
  projects: ResearchProject[];
  onDelete: (id: string) => void | Promise<void>;
  onDeleteMultiple: (ids: string[]) => void | Promise<void>;
  onDeleteAll: () => void | Promise<void>;
  canRestoreLastDelete?: boolean;
  onRestoreLastDelete?: () => void | Promise<void | number>;
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
  canRestoreLastDelete = false,
  onRestoreLastDelete,
  onImport,
  onUpdateProject,
  onSyncProject,
  initialViewProjectId,
  onInitialViewConsumed,
}: DataTableViewProps) {
  const { user } = useAuthContext();
  const canDeleteProjects = user?.role !== 'specialist';
  const { message, notify, dismiss } = useNotification();

  const [editingProject, setEditingProject] = useState<ResearchProject | null>(null);
  const [viewingProjectId, setViewingProjectId] = useState<string | null>(null);

  const uniqueProjects = useMemo(() => dedupeProjects(projects), [projects]);

  useEffect(() => {
    if (!initialViewProjectId) return;
    const exists = uniqueProjects.some((p) => p.id === initialViewProjectId);
    if (exists) {
      setViewingProjectId(initialViewProjectId);
    }
    onInitialViewConsumed?.();
  }, [initialViewProjectId, uniqueProjects, onInitialViewConsumed]);

  const viewingProject = useMemo(
    () => (viewingProjectId ? uniqueProjects.find((p) => p.id === viewingProjectId) : undefined),
    [uniqueProjects, viewingProjectId],
  );

  const handleImportFeedback = (result: ImportFeedback) => {
    notify(result.ok ? `Đã nhập ${result.count} bản ghi từ Excel.` : result.message);
  };

  const handleDeleteOne = useCallback(
    async (id: string): Promise<boolean> => {
      const project = uniqueProjects.find((p) => p.id === id);
      const label = project?.title || project?.contractId || id;
      const confirmed = window.confirm(
        `Bạn có chắc muốn xóa đề tài "${label}"?\n\nDữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống và không còn xuất hiện khi tải Excel.`,
      );
      if (!confirmed) return false;

      try {
        await Promise.resolve(onDelete(id));
        if (viewingProjectId === id) setViewingProjectId(null);
        notify('Đã xóa đề tài thành công.');
        return true;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Không xóa được đề tài. Vui lòng thử lại.';
        notify(msg);
        return false;
      }
    },
    [onDelete, uniqueProjects, viewingProjectId],
  );

  const handleDeleteMultiple = useCallback(
    async (ids: string[]) => {
      const uniqueIds = [...new Set(ids.filter(Boolean))];
      if (uniqueIds.length === 0) return;

      const confirmed = window.confirm(
        `Bạn có chắc muốn xóa ${uniqueIds.length} đề tài đã chọn?\n\nDữ liệu sẽ bị xóa vĩnh viễn và không còn trong file Excel xuất ra.`,
      );
      if (!confirmed) return;

      try {
        await Promise.resolve(onDeleteMultiple(uniqueIds));
        notify(`Đã xóa ${uniqueIds.length} đề tài.`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Không xóa được các đề tài đã chọn.';
        notify(msg);
      }
    },
    [onDeleteMultiple],
  );

  const handleDeleteAll = useCallback(async () => {
    // Confirm is already handled in useDataTable; still guard empty list.
    if (uniqueProjects.length === 0) return;
    try {
      await Promise.resolve(onDeleteAll());
      notify(`Đã xóa tất cả ${uniqueProjects.length} bản ghi.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Không xóa được toàn bộ dữ liệu.';
      notify(msg);
    }
  }, [onDeleteAll, uniqueProjects.length]);

  const handleRestoreLastDelete = useCallback(async () => {
    if (!onRestoreLastDelete) return;
    try {
      const count = await Promise.resolve(onRestoreLastDelete());
      if (!count) {
        notify('Chưa có thao tác xóa để khôi phục.');
        return;
      }
      notify(count === 1 ? 'Đã khôi phục đề tài vừa xóa.' : `Đã khôi phục ${count} đề tài vừa xóa.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Không khôi phục được dữ liệu đã xóa.';
      notify(msg);
    }
  }, [onRestoreLastDelete, notify]);

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
          onDelete={canDeleteProjects ? handleDeleteOne : undefined}
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
        projects={uniqueProjects}
        onDelete={handleDeleteOne}
        onEdit={handleEdit}
        onView={handleView}
        onImport={onImport}
        onImportFeedback={handleImportFeedback}
        onDeleteMultiple={handleDeleteMultiple}
        onDeleteAll={handleDeleteAll}
        canRestoreLastDelete={canRestoreLastDelete}
        onRestoreLastDelete={handleRestoreLastDelete}
        canDeleteProjects={canDeleteProjects}
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
