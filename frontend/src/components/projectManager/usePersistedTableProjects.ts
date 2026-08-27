import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuthContext } from '../../contexts/AuthContext.js';
import { researchProjectService } from '../../services/index.js';
import { dedupeProjects, findExistingProjectMatch } from '../DataTable/dedupeProjects.js';
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
  canRestoreLastDelete: boolean;
  onDelete: (id: string) => Promise<void>;
  onDeleteMultiple: (ids: string[]) => Promise<void>;
  onDeleteAll: () => Promise<void>;
  onRestoreLastDelete: () => Promise<number>;
  onImport: (rows: Partial<TableProject>[], file?: File) => Promise<void>;
  onSaveProject: (project: TableProject) => Promise<TableProject>;
  onUpdateProject: (project: TableProject) => Promise<TableProject>;
  onSyncProject: (project: TableProject) => void;
};

export function usePersistedTableProjects(): UsePersistedTableProjectsResult {
  const { user } = useAuthContext();
  const [tableProjects, setTableProjects] = useState<TableProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [canRestoreLastDelete, setCanRestoreLastDelete] = useState(false);
  const tableProjectsRef = useRef(tableProjects);
  tableProjectsRef.current = tableProjects;
  const lastDeletedRef = useRef<TableProject[]>([]);
  const restoringRef = useRef(false);

  const rememberDeleted = useCallback((ids: string[] | 'all') => {
    const current = tableProjectsRef.current;
    lastDeletedRef.current =
      ids === 'all' ? [...current] : current.filter((project) => ids.includes(project.id));
    setCanRestoreLastDelete(lastDeletedRef.current.length > 0);
  }, []);

  const actor = useMemo(() => resolveHistoryActor(user), [user]);

  const reloadFromServer = useCallback(async () => {
    const projects = await researchProjectService.getAll();
    setTableProjects(dedupeProjects(projects));
    setLoadError(null);
    return projects;
  }, []);

  useEffect(() => {
    let cancelled = false;

    researchProjectService
      .getAll()
      .then((projects) => {
        if (!cancelled) {
          setTableProjects(dedupeProjects(projects));
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

  const onDelete = useCallback(
    async (id: string) => {
      rememberDeleted([id]);
      await researchProjectService.deleteOne(id);
      // Optimistic local remove, then hard-sync from server so Excel/UI never keep ghosts.
      setTableProjects((prev) => prev.filter((p) => p.id !== id));
      try {
        await reloadFromServer();
      } catch {
        /* local filter already applied */
      }
    },
    [rememberDeleted, reloadFromServer],
  );

  const onDeleteMultiple = useCallback(
    async (ids: string[]) => {
      const uniqueIds = [...new Set(ids.filter(Boolean))];
      if (uniqueIds.length === 0) return;

      rememberDeleted(uniqueIds);
      await researchProjectService.deleteMany(uniqueIds);
      const idSet = new Set(uniqueIds);
      setTableProjects((prev) => prev.filter((p) => !idSet.has(p.id)));
      try {
        await reloadFromServer();
      } catch {
        /* local filter already applied */
      }
    },
    [rememberDeleted, reloadFromServer],
  );

  const onDeleteAll = useCallback(async () => {
    rememberDeleted('all');
    await researchProjectService.deleteAll();
    setTableProjects([]);
    try {
      await reloadFromServer();
    } catch {
      setTableProjects([]);
    }
  }, [rememberDeleted, reloadFromServer]);

  const onRestoreLastDelete = useCallback(async () => {
    if (restoringRef.current) return 0;
    const toRestore = lastDeletedRef.current;
    if (toRestore.length === 0) return 0;

    restoringRef.current = true;
    try {
      if (toRestore.length === 1) {
        await researchProjectService.upsert(toRestore[0]!);
      } else {
        await researchProjectService.bulkCreate(toRestore);
      }
      lastDeletedRef.current = [];
      setCanRestoreLastDelete(false);
      await reloadFromServer();
      return toRestore.length;
    } finally {
      restoringRef.current = false;
    }
  }, [reloadFromServer]);

  const onImport = useCallback(
    async (rows: Partial<TableProject>[], file?: File) => {
      const prepared = (rows as TableProject[]).map((row) => withImportHistory(row, actor));
      const existing = tableProjectsRef.current;

      const toCreate: TableProject[] = [];
      const toUpdate: TableProject[] = [];

      for (const row of prepared) {
        const match = findExistingProjectMatch(existing, row);
        if (match) {
          toUpdate.push({
            ...match,
            ...row,
            id: match.id,
            history: row.history?.length ? row.history : match.history,
          });
        } else {
          toCreate.push(row);
        }
      }

      let importFileId: string | undefined;
      if (file) {
        const uploadResult = await researchProjectService.uploadImportFile(
          file,
          prepared.length,
        );
        importFileId = uploadResult.file.id;
      }

      for (const project of toUpdate) {
        await researchProjectService.upsert(project);
      }

      if (toCreate.length > 0) {
        await researchProjectService.bulkCreate(toCreate, importFileId);
      }

      await reloadFromServer();
    },
    [actor, reloadFromServer],
  );

  const onSaveProject = useCallback(
    async (project: TableProject) => {
      const toSave = withCreateHistory(project, actor);
      const saved = await researchProjectService.upsert(toSave);
      setTableProjects((prev) => dedupeProjects([...prev, saved]));
      return saved;
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
        if (idx === -1) return dedupeProjects([...prev, saved]);
        return dedupeProjects(prev.map((p) => (p.id === saved.id ? saved : p)));
      });
      return saved;
    },
    [actor],
  );

  const onSyncProject = useCallback((project: TableProject) => {
    setTableProjects((prev) =>
      dedupeProjects(prev.map((p) => (p.id === project.id ? project : p))),
    );
  }, []);

  return {
    tableProjects,
    overviewProjects,
    loading,
    loadError,
    canRestoreLastDelete,
    onDelete,
    onDeleteMultiple,
    onDeleteAll,
    onRestoreLastDelete,
    onImport,
    onSaveProject,
    onUpdateProject,
    onSyncProject,
  };
}
