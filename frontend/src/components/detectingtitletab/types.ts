import type { ResearchProject } from '../DataTable/types.js';

export type MatchMode = 'strict' | 'fuzzy';

export type DuplicateGroup = {
  normalizedTitle: string;
  representativeTitle: string;
  years: number[];
  projects: ResearchProject[];
};

export type DuplicateStats = {
  groupCount: number;
  projectCount: number;
  yearCount: number;
};

export type DuplicateFilterOptions = {
  yearFrom: number | null;
  yearTo: number | null;
  matchMode: MatchMode;
  titleQuery?: string;
};

export type DuplicateFilterState = {
  titleQuery: string;
  yearFrom: number | null;
  yearTo: number | null;
  matchMode: MatchMode;
};

export type LocTrungDeTaiPageProps = {
  projects: ResearchProject[];
  onUpdateProject: (project: ResearchProject) => void;
  onNavigateHome?: () => void;
  onNavigateDeTaiKhcn?: () => void;
};
