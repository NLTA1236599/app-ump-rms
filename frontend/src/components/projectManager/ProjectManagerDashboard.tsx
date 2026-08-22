import { useEffect, useMemo, useState } from 'react';

import { DataTableView } from '../DataTable/index.js';
import type { ResearchProject as TableProject } from '../DataTable/types.js';
import { LocTrungDeTaiPage } from '../detectingtitletab/index.js';
import { DataEntryPage } from '../DataEntry/index.js';
import { ProgressTrackingPage } from '../ProgressTracking/index.js';
import { WorkflowProcessPage } from '../WorkflowProcess/index.js';

import {
  DE_TAI_KHCN_SIDEBAR_ITEMS,
  DEFAULT_DE_TAI_KHCN_SIDEBAR_ITEM,
  type DeTaiKhcnSidebarItemId,
} from './deTaiKhcnSidebarNav.js';
import { ProjectOverviewView } from './ProjectOverviewView.js';
import {
  TAB_SIDEBAR_COLLAPSED_OFFSET_CLASS,
  TAB_SIDEBAR_OFFSET_CLASS,
} from './sidebarConstants.js';
import { TabSidebar } from './TabSidebar.js';
import { usePersistedTableProjects } from './usePersistedTableProjects.js';
import type { ResearchProject } from './types.js';
import { useAllowedFeatures } from '../../hooks/useAllowedFeatures.js';

export type ProjectManagerDashboardProps = {
  chatHandler?: (query: string, projects: ResearchProject[]) => Promise<string>;
  initialViewProjectId?: string | null;
  onInitialViewConsumed?: () => void;
};

type ProjectDataHandlers = {
  tableProjects: TableProject[];
  overviewProjects: ResearchProject[];
  onDelete: (id: string) => Promise<void>;
  onDeleteMultiple: (ids: string[]) => Promise<void>;
  onDeleteAll: () => Promise<void>;
  canRestoreLastDelete: boolean;
  onRestoreLastDelete: () => Promise<number>;
  onImport: (rows: Partial<TableProject>[], file?: File) => Promise<void>;
  onSaveProject: (project: TableProject) => Promise<void>;
  onUpdateProject: (project: TableProject) => Promise<void>;
  onSyncProject: (project: TableProject) => void;
  onNavigateSidebar: (id: DeTaiKhcnSidebarItemId) => void;
  onViewProjectFromOverview: (projectId: string) => void;
  initialViewProjectId?: string | null;
  onInitialViewConsumed?: () => void;
};

function renderSidebarContent(
  activeItemId: DeTaiKhcnSidebarItemId,
  projectData: ProjectDataHandlers,
  chatHandler?: ProjectManagerDashboardProps['chatHandler'],
) {
  switch (activeItemId) {
    case 'tong-quan':
      return (
        <ProjectOverviewView
          projects={projectData.overviewProjects}
          chatHandler={chatHandler}
          onViewProject={projectData.onViewProjectFromOverview}
          onOpenDataTable={() => projectData.onNavigateSidebar('du-lieu-de-tai')}
        />
      );
    case 'tien-do-thuc-hien':
      return (
        <ProgressTrackingPage
          projects={projectData.tableProjects}
          onUpdateProject={projectData.onUpdateProject}
        />
      );
    case 'du-lieu-de-tai':
      return (
        <DataTableView
          projects={projectData.tableProjects}
          onDelete={projectData.onDelete}
          onDeleteMultiple={projectData.onDeleteMultiple}
          onDeleteAll={projectData.onDeleteAll}
          canRestoreLastDelete={projectData.canRestoreLastDelete}
          onRestoreLastDelete={projectData.onRestoreLastDelete}
          onImport={projectData.onImport}
          onUpdateProject={projectData.onUpdateProject}
          onSyncProject={projectData.onSyncProject}
          initialViewProjectId={projectData.initialViewProjectId}
          onInitialViewConsumed={projectData.onInitialViewConsumed}
        />
      );
    case 'nhap-moi-du-lieu':
      return <DataEntryPage onSaveProject={projectData.onSaveProject} />;
    case 'ke-khai-ho-so':
      return <WorkflowProcessPage />;
    case 'loc-trung-de-tai':
      return (
        <LocTrungDeTaiPage
          projects={projectData.tableProjects}
          onUpdateProject={projectData.onUpdateProject}
          onNavigateHome={() => projectData.onNavigateSidebar('tong-quan')}
          onNavigateDeTaiKhcn={() => projectData.onNavigateSidebar('tong-quan')}
        />
      );
    default: {
      const _n: never = activeItemId;
      return _n;
    }
  }
}

/** Shell for tab "Đề tài KHCN" — sidebar + routed sub-views. */
export function ProjectManagerDashboard({
  chatHandler,
  initialViewProjectId,
  onInitialViewConsumed,
}: ProjectManagerDashboardProps) {
  const persisted = usePersistedTableProjects();
  const allowedFeatures = useAllowedFeatures();
  const [activeItemId, setActiveItemId] = useState<DeTaiKhcnSidebarItemId>(
    DEFAULT_DE_TAI_KHCN_SIDEBAR_ITEM,
  );
  const [overviewViewProjectId, setOverviewViewProjectId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const visibleItems = useMemo(() => {
    if (!allowedFeatures) return [];
    return DE_TAI_KHCN_SIDEBAR_ITEMS.filter((item) => allowedFeatures.has(item.id));
  }, [allowedFeatures]);

  const canOpen = (id: DeTaiKhcnSidebarItemId) =>
    Boolean(allowedFeatures?.has(id));

  const goToSidebar = (id: DeTaiKhcnSidebarItemId) => {
    if (!canOpen(id)) return;
    setActiveItemId(id);
  };

  useEffect(() => {
    if (!allowedFeatures) return;
    if (allowedFeatures.has(activeItemId)) return;
    const fallback = visibleItems[0]?.id;
    if (fallback) setActiveItemId(fallback);
  }, [allowedFeatures, activeItemId, visibleItems]);

  useEffect(() => {
    if (!initialViewProjectId && !overviewViewProjectId) return;
    if (allowedFeatures && !allowedFeatures.has('du-lieu-de-tai')) return;
    setActiveItemId('du-lieu-de-tai');
  }, [initialViewProjectId, overviewViewProjectId, allowedFeatures]);

  const effectiveViewProjectId = initialViewProjectId ?? overviewViewProjectId;

  const handleInitialViewConsumed = () => {
    setOverviewViewProjectId(null);
    onInitialViewConsumed?.();
  };

  const projectData: ProjectDataHandlers = {
    tableProjects: persisted.tableProjects,
    overviewProjects: persisted.overviewProjects,
    onDelete: persisted.onDelete,
    onDeleteMultiple: persisted.onDeleteMultiple,
    onDeleteAll: persisted.onDeleteAll,
    canRestoreLastDelete: persisted.canRestoreLastDelete,
    onRestoreLastDelete: persisted.onRestoreLastDelete,
    onImport: persisted.onImport,
    onSaveProject: persisted.onSaveProject,
    onUpdateProject: persisted.onUpdateProject,
    onSyncProject: persisted.onSyncProject,
    onNavigateSidebar: goToSidebar,
    onViewProjectFromOverview: (projectId) => {
      if (!canOpen('du-lieu-de-tai')) return;
      setOverviewViewProjectId(projectId);
      setActiveItemId('du-lieu-de-tai');
    },
    initialViewProjectId: effectiveViewProjectId,
    onInitialViewConsumed: handleInitialViewConsumed,
  };

  if (persisted.loading || !allowedFeatures) {
    return (
      <div className="flex min-h-[calc(100vh-96px)] items-center justify-center text-sm text-slate-500">
        Đang tải dữ liệu đề tài…
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-96px)]">
      {persisted.loadError && (
        <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 md:mx-6">
          {persisted.loadError}
        </div>
      )}

      <TabSidebar
        activeItemId={activeItemId}
        onItemSelect={goToSidebar}
        tableProjects={persisted.tableProjects}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        items={visibleItems}
      />

      <div
        className={`min-h-[calc(100vh-96px)] transition-[margin] duration-200 ${
          sidebarCollapsed ? TAB_SIDEBAR_COLLAPSED_OFFSET_CLASS : TAB_SIDEBAR_OFFSET_CLASS
        }`}
      >
        <div className="p-1.5 md:p-2">
          {canOpen(activeItemId) ? (
            renderSidebarContent(activeItemId, projectData, chatHandler)
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
              Tài khoản của bạn không được phép xem mục này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
