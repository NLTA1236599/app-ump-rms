import { useMemo, useState } from 'react';

import { Breadcrumb } from '../DataTable/Breadcrumb.js';
import { PageTitleBar } from '../DataTable/PageTitleBar.js';
import { ProjectEditModal } from '../DataTable/ProjectEditModal.js';
import type { ResearchProject } from '../DataTable/types.js';
import { ProjectDetail } from '../viewbutton/index.js';

import { LOC_TRUNG_BREADCRUMBS } from './constants.js';
import {
  computeDuplicateStats,
  getAvailableYears,
  getDuplicateGroups,
} from './detectDuplicateTitles.js';
import { DuplicateGroupList } from './DuplicateGroupList.js';
import { DuplicateStatsStrip } from './DuplicateStatsStrip.js';
import { DuplicateToolbar } from './DuplicateToolbar.js';
import { exportDuplicateGroups } from './exportDuplicateGroups.js';
import type { DuplicateFilterState, LocTrungDeTaiPageProps } from './types.js';

const DEFAULT_DRAFT: DuplicateFilterState = {
  titleQuery: '',
  yearFrom: null,
  yearTo: null,
  matchMode: 'strict',
};

export function LocTrungDeTaiPage({
  projects,
  onUpdateProject,
  onNavigateHome,
  onNavigateDeTaiKhcn,
}: LocTrungDeTaiPageProps) {
  const [draft, setDraft] = useState<DuplicateFilterState>(DEFAULT_DRAFT);
  const [applied, setApplied] = useState<DuplicateFilterState | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [viewingProject, setViewingProject] = useState<ResearchProject | null>(null);
  const [editingProject, setEditingProject] = useState<ResearchProject | null>(null);

  const availableYears = useMemo(() => getAvailableYears(projects), [projects]);

  const duplicateGroups = useMemo(() => {
    if (!applied) return [];
    return getDuplicateGroups(projects, applied);
  }, [projects, applied]);

  const stats = useMemo(() => computeDuplicateStats(duplicateGroups), [duplicateGroups]);

  const liveViewingProject = useMemo(() => {
    if (!viewingProject) return null;
    return projects.find((p) => p.id === viewingProject.id) ?? viewingProject;
  }, [projects, viewingProject]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleFilter = () => {
    setApplied({ ...draft });
    setExpandedGroups(new Set());
  };

  const handleReset = () => {
    setDraft(DEFAULT_DRAFT);
    setApplied(null);
    setExpandedGroups(new Set());
  };

  const handleBreadcrumbNavigate = (href: string) => {
    if (href === '/') onNavigateHome?.();
    else if (href === '/de-tai-khcn') onNavigateDeTaiKhcn?.();
  };

  const handleView = (project: ResearchProject) => {
    setViewingProject(project);
  };

  const handleEdit = (project: ResearchProject) => {
    setEditingProject(project);
  };

  const handleSaveEdit = (project: ResearchProject) => {
    onUpdateProject(project);
  };

  if (liveViewingProject) {
    return (
      <>
        <ProjectDetail
          project={liveViewingProject}
          onBack={() => setViewingProject(null)}
          onEdit={(p) => {
            setViewingProject(null);
            setEditingProject(p);
          }}
          onUpdateProject={onUpdateProject}
        />
        <ProjectEditModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={handleSaveEdit}
        />
      </>
    );
  }

  return (
    <div className="bg-slate-50">
      <Breadcrumb items={LOC_TRUNG_BREADCRUMBS} onNavigate={handleBreadcrumbNavigate} />
      <PageTitleBar title="Lọc Trùng Đề Tài" />

      <DuplicateStatsStrip stats={stats} />

      <div className="px-4 pb-4">
        <DuplicateToolbar
          titleQuery={draft.titleQuery}
          availableYears={availableYears}
          yearFrom={draft.yearFrom}
          yearTo={draft.yearTo}
          matchMode={draft.matchMode}
          onTitleQueryChange={(titleQuery) => setDraft((prev) => ({ ...prev, titleQuery }))}
          onYearFromChange={(yearFrom) => setDraft((prev) => ({ ...prev, yearFrom }))}
          onYearToChange={(yearTo) => setDraft((prev) => ({ ...prev, yearTo }))}
          onMatchModeChange={(matchMode) => setDraft((prev) => ({ ...prev, matchMode }))}
          onFilter={handleFilter}
          onExport={() => exportDuplicateGroups(duplicateGroups)}
          onReset={handleReset}
        />
      </div>

      <div className="px-4">
        <DuplicateGroupList
          groups={duplicateGroups}
          expandedGroups={expandedGroups}
          hasFiltered={applied !== null}
          onToggleGroup={toggleGroup}
          onView={handleView}
          onEdit={handleEdit}
        />
      </div>

      <ProjectEditModal
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
