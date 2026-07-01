import { useEffect, useState } from 'react';

import { DataTableView } from '../DataTable/index.js';
import type { ResearchProject as TableProject } from '../DataTable/types.js';
import { LocTrungDeTaiPage } from '../detectingtitletab/index.js';
import { DataEntryPage } from '../DataEntry/index.js';
import { ProgressTrackingPage } from '../ProgressTracking/index.js';
import { WorkflowProcessPage } from '../WorkflowProcess/index.js';

import {
  DEFAULT_DE_TAI_KHCN_SIDEBAR_ITEM,
  type DeTaiKhcnSidebarItemId,
} from './deTaiKhcnSidebarNav.js';
import { ProjectOverviewView } from './ProjectOverviewView.js';
import { TAB_SIDEBAR_OFFSET_CLASS } from './sidebarConstants.js';
import { TabSidebar } from './TabSidebar.js';
import { usePersistedTableProjects } from './usePersistedTableProjects.js';
import type { ResearchProject } from './types.js';

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
  onImport: (rows: Partial<TableProject>[], file?: File) => Promise<void>;
  onSaveProject: (project: TableProject) => Promise<void>;
  onUpdateProject: (project: TableProject) => Promise<void>;
  onSyncProject: (project: TableProject) => void;
  onNavigateSidebar: (id: DeTaiKhcnSidebarItemId) => void;
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
        <ProjectOverviewView projects={projectData.overviewProjects} chatHandler={chatHandler} />
      );
    case 'tien-do-thuc-hien':
      return <ProgressTrackingPage projects={projectData.tableProjects} />;
    case 'du-lieu-de-tai':
      return (
        <DataTableView
          projects={projectData.tableProjects}
          onDelete={projectData.onDelete}
          onDeleteMultiple={projectData.onDeleteMultiple}
          onDeleteAll={projectData.onDeleteAll}
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
  const [activeItemId, setActiveItemId] = useState<DeTaiKhcnSidebarItemId>(
    DEFAULT_DE_TAI_KHCN_SIDEBAR_ITEM,
  );

  useEffect(() => {
    if (!initialViewProjectId) return;
    setActiveItemId('du-lieu-de-tai');
  }, [initialViewProjectId]);

  const projectData: ProjectDataHandlers = {
    tableProjects: persisted.tableProjects,
    overviewProjects: persisted.overviewProjects,
    onDelete: persisted.onDelete,
    onDeleteMultiple: persisted.onDeleteMultiple,
    onDeleteAll: persisted.onDeleteAll,
    onImport: persisted.onImport,
    onSaveProject: persisted.onSaveProject,
    onUpdateProject: persisted.onUpdateProject,
    onSyncProject: persisted.onSyncProject,
    onNavigateSidebar: setActiveItemId,
    initialViewProjectId,
    onInitialViewConsumed,
  };

  if (persisted.loading) {
    return (
      <div className="flex min-h-[calc(100vh-110px)] items-center justify-center text-sm text-slate-500">
        Đang tải dữ liệu đề tài…
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-110px)]">
      {persisted.loadError && (
        <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 md:mx-6">
          {persisted.loadError}
        </div>
      )}

      <TabSidebar
        activeItemId={activeItemId}
        onItemSelect={setActiveItemId}
        tableProjects={persisted.tableProjects}
      />

      <div className={`min-h-[calc(100vh-110px)] ${TAB_SIDEBAR_OFFSET_CLASS}`}>
        <div className="p-4 md:p-6">{renderSidebarContent(activeItemId, projectData, chatHandler)}</div>
      </div>
    </div>
  );
}
