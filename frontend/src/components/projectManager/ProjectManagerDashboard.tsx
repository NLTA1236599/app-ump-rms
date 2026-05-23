import { useState } from 'react';

import { DataTableView } from '../DataTable/index.js';
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

function renderSidebarContent(
  activeItemId: DeTaiKhcnSidebarItemId,
  projects: ResearchProject[],
  chatHandler?: ProjectManagerDashboardProps['chatHandler'],
) {
  switch (activeItemId) {
    case 'tong-quan':
      return <ProjectOverviewView projects={projects} chatHandler={chatHandler} />;
    case 'tien-do-thuc-hien':
      return <ProgressTrackingPage />;
    case 'du-lieu-de-tai':
      return <DataTableView sourceProjects={projects} />;
    case 'nhap-moi-du-lieu':
      return <DataEntryPage />;
    case 'ke-khai-ho-so':
      return <WorkflowProcessPage />;
    default: {
      const _n: never = activeItemId;
      return _n;
    }
  }
}

/** Shell for tab "Đề tài KHCN" — sidebar + routed sub-views. */
export function ProjectManagerDashboard({ projects, chatHandler }: ProjectManagerDashboardProps) {
  const [activeItemId, setActiveItemId] = useState<DeTaiKhcnSidebarItemId>(
    DEFAULT_DE_TAI_KHCN_SIDEBAR_ITEM,
  );

  return (
    <div className="relative min-h-[calc(100vh-110px)]">
      <TabSidebar activeItemId={activeItemId} onItemSelect={setActiveItemId} />

      <div className={`min-h-[calc(100vh-110px)] ${TAB_SIDEBAR_OFFSET_CLASS}`}>
        <div className="p-4 md:p-6">{renderSidebarContent(activeItemId, projects, chatHandler)}</div>
      </div>
    </div>
  );
}
