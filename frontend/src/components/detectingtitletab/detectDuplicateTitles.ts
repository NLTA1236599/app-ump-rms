import type { ResearchProject } from '../DataTable/types.js';

import { FUZZY_OVERLAP_THRESHOLD } from './constants.js';
import { getProjectYear, getProjectYears } from './extractYear.js';
import { normalizeTitle, titleOverlap } from './titleNormalize.js';
import type { DuplicateFilterOptions, DuplicateGroup, DuplicateStats, MatchMode } from './types.js';

function titlesMatch(a: string | undefined, b: string | undefined, matchMode: MatchMode): boolean {
  const normA = normalizeTitle(a);
  const normB = normalizeTitle(b);
  if (!normA || !normB) return false;

  if (matchMode === 'strict') return normA === normB;

  return titleOverlap(a, b) >= FUZZY_OVERLAP_THRESHOLD;
}

export function filterProjectsByYearRange(
  projects: ResearchProject[],
  yearFrom: number | null,
  yearTo: number | null,
): ResearchProject[] {
  return projects.filter((p) => {
    const years = getProjectYears(p);
    if (years.length === 0) return true;
    return years.some((year) => {
      if (yearFrom !== null && year < yearFrom) return false;
      if (yearTo !== null && year > yearTo) return false;
      return true;
    });
  });
}

function toDuplicateGroup(projects: ResearchProject[], key: string): DuplicateGroup {
  const years = new Set<number>();
  for (const project of projects) {
    const year = getProjectYear(project);
    if (year !== null) years.add(year);
  }

  const sortedProjects = [...projects].sort((a, b) => {
    const ya = getProjectYear(a) ?? 0;
    const yb = getProjectYear(b) ?? 0;
    return ya - yb;
  });

  return {
    normalizedTitle: key,
    representativeTitle: sortedProjects[0]?.title ?? key,
    years: [...years].sort((a, b) => a - b),
    projects: sortedProjects,
  };
}

function groupByExactTitle(projects: ResearchProject[]): ResearchProject[][] {
  const map = new Map<string, ResearchProject[]>();

  for (const project of projects) {
    const key = normalizeTitle(project.title);
    if (!key) continue;
    const bucket = map.get(key);
    if (bucket) bucket.push(project);
    else map.set(key, [project]);
  }

  return [...map.values()];
}

function clusterByOverlap(projects: ResearchProject[]): ResearchProject[][] {
  const eligible = projects.filter((p) => normalizeTitle(p.title));
  const n = eligible.length;
  if (n === 0) return [];

  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[rb] = ra;
  };

  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      if (titlesMatch(eligible[i]?.title, eligible[j]?.title, 'fuzzy')) {
        union(i, j);
      }
    }
  }

  const clusters = new Map<number, ResearchProject[]>();
  for (let i = 0; i < n; i += 1) {
    const root = find(i);
    const bucket = clusters.get(root);
    const project = eligible[i];
    if (!project) continue;
    if (bucket) bucket.push(project);
    else clusters.set(root, [project]);
  }

  return [...clusters.values()];
}

function sortGroups(groups: DuplicateGroup[]): DuplicateGroup[] {
  return groups.sort((a, b) => {
    const yearDiff = b.years.length - a.years.length;
    if (yearDiff !== 0) return yearDiff;
    return b.projects.length - a.projects.length;
  });
}

export function filterGroupsByTitle(
  groups: DuplicateGroup[],
  titleQuery: string,
  matchMode: MatchMode,
): DuplicateGroup[] {
  const query = titleQuery.trim();
  if (!query) return groups;

  return groups.filter((g) => titlesMatch(g.representativeTitle, query, matchMode));
}

export function getDuplicateGroups(
  projects: ResearchProject[],
  options: DuplicateFilterOptions,
): DuplicateGroup[] {
  const yearFiltered = filterProjectsByYearRange(projects, options.yearFrom, options.yearTo);
  const query = options.titleQuery?.trim() ?? '';

  const candidates = query
    ? yearFiltered.filter((p) => titlesMatch(p.title, query, options.matchMode))
    : yearFiltered;

  const clusters =
    options.matchMode === 'fuzzy' ? clusterByOverlap(candidates) : groupByExactTitle(candidates);

  // Searching a specific title: show every match, even a single existing project.
  // Scanning all titles: only keep real duplicates (2+ projects).
  const minSize = query ? 1 : 2;

  const groups = clusters
    .filter((cluster) => cluster.length >= minSize)
    .map((cluster) =>
      toDuplicateGroup(cluster, normalizeTitle(cluster[0]?.title) || query || 'unknown'),
    );

  return sortGroups(groups);
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
    for (const y of getProjectYears(p)) years.add(y);
  }
  return [...years].sort((a, b) => a - b);
}
