import { useMemo, useState } from 'react';

import { DataTableView } from '../DataTable/index.js';
import { mapTableToPmProjects, mapToTableProjects } from '../DataTable/mapToTableProjects.js';
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
import type { ResearchProject } from './types.js';

export type ProjectManagerDashboardProps = {
  projects: ResearchProject[];
  chatHandler?: (query: string, projects: ResearchProject[]) => Promise<string>;
};

type ProjectDataHandlers = {
  tableProjects: TableProject[];
  overviewProjects: ResearchProject[];
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onDeleteAll: () => void;
  onImport: (rows: Partial<TableProject>[]) => void;
  onSaveProject: (project: TableProject) => void;
  onUpdateProject: (project: TableProject) => void;
  onNavigateSidebar: (id: DeTaiKhcnSidebarItemId) => void;
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
  projects: initialProjects,
  chatHandler,
}: ProjectManagerDashboardProps) {
  const [tableProjects, setTableProjects] = useState<TableProject[]>(() =>
    mapToTableProjects(initialProjects),
  );
  const [activeItemId, setActiveItemId] = useState<DeTaiKhcnSidebarItemId>(
    DEFAULT_DE_TAI_KHCN_SIDEBAR_ITEM,
  );

  const overviewProjects = useMemo(
    () => mapTableToPmProjects(tableProjects),
    [tableProjects],
  );

  const removeByIds = (ids: string[]) => {
    const idSet = new Set(ids);
    setTableProjects((prev) => prev.filter((p) => !idSet.has(p.id)));
  };

  const projectData: ProjectDataHandlers = {
    tableProjects,
    overviewProjects,
    onDelete: (id) => removeByIds([id]),
    onDeleteMultiple: removeByIds,
    onDeleteAll: () => setTableProjects([]),
    onImport: (rows) => {
      setTableProjects((prev) => [...prev, ...(rows as TableProject[])]);
    },
    onSaveProject: (project) => {
      setTableProjects((prev) => [...prev, project]);
    },
    onUpdateProject: (project) => {
      setTableProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
    },
    onNavigateSidebar: setActiveItemId,
  };

  return (
    <div className="relative min-h-[calc(100vh-110px)]">
      <TabSidebar
        activeItemId={activeItemId}
        onItemSelect={setActiveItemId}
        tableProjects={tableProjects}
      />

      <div className={`min-h-[calc(100vh-110px)] ${TAB_SIDEBAR_OFFSET_CLASS}`}>
        <div className="p-4 md:p-6">{renderSidebarContent(activeItemId, projectData, chatHandler)}</div>
      </div>
    </div>
  );
}
