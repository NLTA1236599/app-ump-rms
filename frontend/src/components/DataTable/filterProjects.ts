import type { ColumnFilters, ProjectStatus, ResearchProject } from './types.js';

export type FilterOptions = {
  searchTerm: string;
  statusFilter: ProjectStatus | 'ALL';
  columnFilters: ColumnFilters;
  contractIdSearch: string;
};

function fieldToFilterString(raw: unknown): string {
  if (raw == null) return '';
  if (Array.isArray(raw)) {
    return raw
      .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
      .join(' ');
  }
  return String(raw);
}

export function filterProjects(projects: ResearchProject[], opts: FilterOptions): ResearchProject[] {
  const { searchTerm, statusFilter, columnFilters, contractIdSearch } = opts;

  return projects
    .filter((p) => {
      if (!contractIdSearch) return true;
      return (p.contractId ?? '').toLowerCase().includes(contractIdSearch.toLowerCase());
    })
    .filter((p) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.title?.toLowerCase().includes(term) ||
        p.leadAuthor?.toLowerCase().includes(term) ||
        p.contractId?.toLowerCase().includes(term) ||
        p.projectCode?.toLowerCase().includes(term)
      );
    })
    .filter((p) => statusFilter === 'ALL' || p.status === statusFilter)
    .filter((p) =>
      Object.entries(columnFilters).every(([colId, filterVal]) => {
        if (!filterVal) return true;
        const raw = p[colId as keyof ResearchProject];
        return fieldToFilterString(raw).toLowerCase().includes(filterVal.toLowerCase());
      }),
    );
}
