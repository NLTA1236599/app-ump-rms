import type { ResearchProject as PmProject } from '../projectManager/types.js';
import type { ResearchProject } from './types.js';

function categoriesToPmValue(categories?: string[] | string): string | undefined {
  if (!categories) return undefined;
  return Array.isArray(categories) ? categories.join(', ') : categories;
}

/** Maps full table rows back into the overview/progress project shape. */
export function mapTableToPmProjects(projects: ResearchProject[]): PmProject[] {
  return projects.map((p) => ({
    id: p.id,
    department: p.department,
    status: p.status,
    researchField: p.researchField,
    researchType: p.researchType,
    progressStatus: p.progressStatus,
    categories: categoriesToPmValue(p.categories),
    startDate: p.startDate != null ? String(p.startDate) : null,
    endDate: p.endDate != null ? String(p.endDate) : null,
    budget: p.budget,
    expectedProducts: p.expectedProducts,
    actualProducts: p.actualProducts,
  }));
}

/** Maps dashboard demo projects into the full table row shape. */
export function mapToTableProjects(projects: PmProject[]): ResearchProject[] {
  return projects.map((p, index) => ({
    id: p.id,
    title: `Đề tài ${p.researchField} — ${p.department}`,
    contractId: `HĐ-${String(index + 1).padStart(4, '0')}`,
    leadAuthor: 'Chưa cập nhật',
    department: p.department,
    researchField: p.researchField,
    researchType: p.researchType,
    progressStatus: p.progressStatus,
    categories: p.categories ? [String(p.categories)] : [],
    startDate: p.startDate,
    endDate: p.endDate,
    budget: p.budget,
    status: p.status,
    projectCode: `DT-${String(index + 1).padStart(4, '0')}`,
    expectedProducts: Array.isArray(p.expectedProducts)
      ? p.expectedProducts.map((item) =>
          typeof item === 'object' ? { type: item.type, count: item.count ?? 0 } : { type: String(item), count: 0 },
        )
      : undefined,
    actualProducts: Array.isArray(p.actualProducts)
      ? p.actualProducts.map((item) =>
          typeof item === 'object' ? { type: item.type, count: item.count ?? 0 } : { type: String(item), count: 0 },
        )
      : undefined,
  }));
}
