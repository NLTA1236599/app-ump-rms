import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuthContext } from '../../contexts/AuthContext.js';
import { researchProjectService } from '../../services/index.js';
import { mapTableToPmProjects } from '../DataTable/mapToTableProjects.js';
import {
  applyProjectUpdateHistory,
  resolveHistoryActor,
  withCreateHistory,
  withImportHistory,
} from '../DataTable/projectHistory.js';
import type { ResearchProject as TableProject } from '../DataTable/types.js';

import type { ResearchProject } from './types.js';

type UsePersistedTableProjectsResult = {
  tableProjects: TableProject[];
  overviewProjects: ResearchProject[];
  loading: boolean;
  loadError: string | null;
  onDelete: (id: string) => Promise<void>;
  onDeleteMultiple: (ids: string[]) => Promise<void>;
  onDeleteAll: () => Promise<void>;
  onImport: (rows: Partial<TableProject>[], file?: File) => Promise<void>;
  onSaveProject: (project: TableProject) => Promise<void>;
  onUpdateProject: (project: TableProject) => Promise<void>;
  onSyncProject: (project: TableProject) => void;
};

export function usePersistedTableProjects(): UsePersistedTableProjectsResult {
  const { user } = useAuthContext();
  const [tableProjects, setTableProjects] = useState<TableProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const tableProjectsRef = useRef(tableProjects);
  tableProjectsRef.current = tableProjects;

  const actor = useMemo(() => resolveHistoryActor(user), [user]);

  useEffect(() => {
    let cancelled = false;

    researchProjectService
      .getAll()
      .then((projects) => {
        if (!cancelled) {
          setTableProjects(projects);
          setLoadError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : 'Không tải được dữ liệu đề tài';
          setLoadError(message);
          setTableProjects([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const overviewProjects = useMemo(
    () => mapTableToPmProjects(tableProjects),
    [tableProjects],
  );

  const onDelete = useCallback(async (id: string) => {
    await researchProjectService.deleteOne(id);
    setTableProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const onDeleteMultiple = useCallback(async (ids: string[]) => {
    await researchProjectService.deleteMany(ids);
    const idSet = new Set(ids);
    setTableProjects((prev) => prev.filter((p) => !idSet.has(p.id)));
  }, []);

  const onDeleteAll = useCallback(async () => {
    await researchProjectService.deleteAll();
    setTableProjects([]);
  }, []);

  const onImport = useCallback(
    async (rows: Partial<TableProject>[], file?: File) => {
      const projects = (rows as TableProject[]).map((row) => withImportHistory(row, actor));
      let importFileId: string | undefined;

      if (file) {
        const uploadResult = await researchProjectService.uploadImportFile(file, projects.length);
        importFileId = uploadResult.file.id;
      }

      const saved = await researchProjectService.bulkCreate(projects, importFileId);
      setTableProjects((prev) => [...prev, ...saved]);
    },
    [actor],
  );

  const onSaveProject = useCallback(
    async (project: TableProject) => {
      const toSave = withCreateHistory(project, actor);
      const saved = await researchProjectService.upsert(toSave);
      setTableProjects((prev) => [...prev, saved]);
    },
    [actor],
  );

  const onUpdateProject = useCallback(
    async (project: TableProject) => {
      const existing = tableProjectsRef.current.find((p) => p.id === project.id);
      const toSave = existing
        ? applyProjectUpdateHistory(existing, project, actor)
        : withCreateHistory(project, actor);
      const saved = await researchProjectService.upsert(toSave);
      setTableProjects((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id);
        if (idx === -1) return [...prev, saved];
        return prev.map((p) => (p.id === saved.id ? saved : p));
      });
    },
    [actor],
  );

  const onSyncProject = useCallback((project: TableProject) => {
    setTableProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
  }, []);

  return {
    tableProjects,
    overviewProjects,
    loading,
    loadError,
    onDelete,
    onDeleteMultiple,
    onDeleteAll,
    onImport,
    onSaveProject,
    onUpdateProject,
    onSyncProject,
  };
}
