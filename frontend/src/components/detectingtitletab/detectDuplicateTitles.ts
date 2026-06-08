import type { ResearchProject } from '../DataTable/types.js';

import { getProjectYear } from './extractYear.js';
import type { DuplicateFilterOptions, DuplicateGroup, DuplicateStats, MatchMode } from './types.js';
import { fuzzyNormalizeTitle, normalizeTitle } from './titleNormalize.js';

function getTitleKey(title: string | undefined, matchMode: MatchMode): string {
  return matchMode === 'fuzzy' ? fuzzyNormalizeTitle(title) : normalizeTitle(title);
}

export function filterProjectsByYearRange(
  projects: ResearchProject[],
  yearFrom: number | null,
  yearTo: number | null,
): ResearchProject[] {
  return projects.filter((p) => {
    const year = getProjectYear(p);
    if (year === null) return true;
    if (yearFrom !== null && year < yearFrom) return false;
    if (yearTo !== null && year > yearTo) return false;
    return true;
  });
}

function titleMatchesQuery(title: string, query: string, matchMode: MatchMode): boolean {
  const normTitle = normalizeTitle(title);
  const normQuery = normalizeTitle(query);
  if (!normQuery) return true;

  if (matchMode === 'strict') {
    return normTitle.includes(normQuery);
  }

  const titleWords = new Set(normTitle.split(' ').filter((w) => w.length > 2));
  const queryWords = normQuery.split(' ').filter((w) => w.length > 2);
  if (queryWords.length === 0) return normTitle.includes(normQuery);

  const matched = queryWords.filter((w) => titleWords.has(w)).length;
  return matched / queryWords.length >= 0.8;
}

export function filterGroupsByTitle(
  groups: DuplicateGroup[],
  titleQuery: string,
  matchMode: MatchMode,
): DuplicateGroup[] {
  const query = titleQuery.trim();
  if (!query) return groups;

  return groups.filter((g) => titleMatchesQuery(g.representativeTitle, query, matchMode));
}

export function getDuplicateGroups(
  projects: ResearchProject[],
  options: DuplicateFilterOptions,
): DuplicateGroup[] {
  const yearFiltered = filterProjectsByYearRange(projects, options.yearFrom, options.yearTo);
  const map = new Map<string, { projects: ResearchProject[]; years: Set<number> }>();

  for (const project of yearFiltered) {
    const key = getTitleKey(project.title, options.matchMode);
    if (!key) continue;

    const year = getProjectYear(project);
    if (year === null) continue;

    if (!map.has(key)) {
      map.set(key, { projects: [], years: new Set() });
    }

    const entry = map.get(key)!;
    entry.projects.push(project);
    entry.years.add(year);
  }

  const groups = [...map.entries()]
    .filter(([, entry]) => entry.years.size >= 2)
    .map(([key, entry]) => ({
      normalizedTitle: key,
      representativeTitle: entry.projects[0]?.title ?? key,
      years: [...entry.years].sort((a, b) => a - b),
      projects: [...entry.projects].sort((a, b) => {
        const ya = getProjectYear(a) ?? 0;
        const yb = getProjectYear(b) ?? 0;
        return ya - yb;
      }),
    }))
    .sort((a, b) => b.years.length - a.years.length);

  return filterGroupsByTitle(groups, options.titleQuery ?? '', options.matchMode);
}

export function computeDuplicateStats(groups: DuplicateGroup[]): DuplicateStats {
  return {
    groupCount: groups.length,
    projectCount: groups.reduce((sum, g) => sum + g.projects.length, 0),
    yearCount: new Set(groups.flatMap((g) => g.years)).size,
  };
}

export function getAvailableYears(projects: ResearchProject[]): number[] {
  const years = new Set<number>();
  for (const p of projects) {
    const y = getProjectYear(p);
    if (y !== null) years.add(y);
  }
  return [...years].sort((a, b) => a - b);
}
