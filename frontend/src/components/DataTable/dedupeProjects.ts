import type { ResearchProject } from './types.js';

function contractKey(contractId?: string | null): string {
  return (contractId ?? '').trim().toLowerCase();
}

/** Remove duplicate rows by `id`, then by non-empty `contractId` (keep first). */
export function dedupeProjects(projects: ResearchProject[]): ResearchProject[] {
  const byId = new Map<string, ResearchProject>();
  for (const project of projects) {
    if (!project?.id) continue;
    if (!byId.has(project.id)) byId.set(project.id, project);
  }

  const seenContracts = new Set<string>();
  const result: ResearchProject[] = [];

  for (const project of byId.values()) {
    const key = contractKey(project.contractId);
    if (key) {
      if (seenContracts.has(key)) continue;
      seenContracts.add(key);
    }
    result.push(project);
  }

  return result;
}

/** Find an existing project that should be updated instead of creating a duplicate. */
export function findExistingProjectMatch(
  projects: ResearchProject[],
  candidate: Partial<ResearchProject>,
): ResearchProject | undefined {
  const key = contractKey(candidate.contractId);
  if (!key) return undefined;
  return projects.find((p) => contractKey(p.contractId) === key);
}
