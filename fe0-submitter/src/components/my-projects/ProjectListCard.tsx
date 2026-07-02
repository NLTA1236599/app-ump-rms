import type { StatusFilterId, SubmitterProject } from '../../types/submitter.js';
import { filterProjects } from '../../utils/projectList.js';
import { EmptyState } from './EmptyState.js';
import { ProjectRow } from './ProjectRow.js';
import { ProjectTableHeader } from './ProjectTableHeader.js';
import { SearchInput } from './SearchInput.js';
import { StatusFilterTabs } from './StatusFilterTabs.js';

type ProjectListCardProps = {
  projects: SubmitterProject[];
  activeStatus: StatusFilterId;
  searchTerm: string;
  onStatusChange: (status: StatusFilterId) => void;
  onSearchChange: (term: string) => void;
};

export function ProjectListCard({
  projects,
  activeStatus,
  searchTerm,
  onStatusChange,
  onSearchChange,
}: ProjectListCardProps) {
  const filteredProjects = filterProjects(projects, activeStatus, searchTerm);
  const totalCount = projects.length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800">Danh sách đề tài</h2>
          <p className="mt-0.5 text-sm text-slate-400">{totalCount} đề tài</p>
        </div>
        <SearchInput value={searchTerm} onChange={onSearchChange} />
      </div>

      <StatusFilterTabs
        activeStatus={activeStatus}
        projects={projects}
        onChange={onStatusChange}
      />

      <div className="mt-2 border-t border-slate-200">
        {filteredProjects.length === 0 ? (
          projects.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="py-16 text-center text-sm text-slate-400">
              Không tìm thấy đề tài phù hợp với bộ lọc hiện tại.
            </div>
          )
        ) : (
          <>
            <ProjectTableHeader />
            {filteredProjects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </>
        )}
      </div>
    </section>
  );
}
